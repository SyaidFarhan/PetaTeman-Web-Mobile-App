package handler

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	fiberws "github.com/gofiber/websocket/v2"
	"github.com/peta/backend/internal/middleware"
	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/service"
)

// Hub manages WebSocket connections per user
type Hub struct {
	mu          sync.RWMutex
	connections map[string]*fiberws.Conn // userID -> ws connection
}

var GlobalHub = &Hub{
	connections: make(map[string]*fiberws.Conn),
}

func (h *Hub) Register(userID string, conn *fiberws.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.connections[userID] = conn
}

func (h *Hub) Unregister(userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.connections, userID)
}

func (h *Hub) BroadcastToUsers(userIDs []string, msg []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, uid := range userIDs {
		if conn, ok := h.connections[uid]; ok {
			if err := conn.WriteMessage(1, msg); err != nil {
				log.Printf("ws write error for user %s: %v", uid, err)
			}
		}
	}
}

type LocationHandler struct {
	locationSvc *service.LocationService
	friendSvc   *service.FriendService
}

func NewLocationHandler(ls *service.LocationService, fs *service.FriendService) *LocationHandler {
	return &LocationHandler{locationSvc: ls, friendSvc: fs}
}

// POST /api/location — REST update (used when WS not available)
func (h *LocationHandler) UpdateLocation(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	var req models.UpdateLocationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	loc, err := h.locationSvc.UpdateLocation(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(loc)
}

// GET /api/location/friends
func (h *LocationHandler) GetFriendsLocations(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	locs, err := h.locationSvc.GetFriendsLocations(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(locs)
}

// GET /api/ws — WebSocket upgrade
func (h *LocationHandler) WebSocketUpgrade(c *fiber.Ctx) error {
	if fiberws.IsWebSocketUpgrade(c) {
		c.Locals("user_id", middleware.GetUserID(c))
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

// WebSocket handler
func (h *LocationHandler) WebSocketHandler() fiber.Handler {
	return fiberws.New(func(c *fiberws.Conn) {
		userID := c.Locals("user_id").(string)
		GlobalHub.Register(userID, c)
		defer func() {
			GlobalHub.Unregister(userID)
			c.Close()
		}()

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				break
			}

			// Expect: {"latitude":x,"longitude":y,"is_realtime_active":true}
			var req models.UpdateLocationRequest
			if err := json.Unmarshal(msg, &req); err != nil {
				continue
			}

			loc, err := h.locationSvc.UpdateLocation(userID, &req)
			if err != nil {
				continue
			}

			// Broadcast to friends
			friendIDs, _ := h.friendSvc.GetFriendIDs(userID)
			update := models.LocationUpdate{
				UserID:           userID,
				Latitude:         loc.Latitude,
				Longitude:        loc.Longitude,
				IsRealtimeActive: req.IsRealtimeActive,
				LastActiveAt:     time.Now(),
			}
			payload, _ := json.Marshal(update)
			GlobalHub.BroadcastToUsers(friendIDs, payload)
		}
	})
}
