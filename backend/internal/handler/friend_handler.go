package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/peta/backend/internal/middleware"
	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/service"
)

type FriendHandler struct {
	svc *service.FriendService
}

func NewFriendHandler(svc *service.FriendService) *FriendHandler {
	return &FriendHandler{svc: svc}
}

// GET /api/friends/search?q=username
func (h *FriendHandler) Search(c *fiber.Ctx) error {
	q := c.Query("q")
	if q == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "query param 'q' required"})
	}
	users, err := h.svc.SearchUsers(q)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(users)
}

// POST /api/friends/request
func (h *FriendHandler) SendRequest(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	var req models.FriendRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	friendship, err := h.svc.SendRequest(userID, req.ReceiverUsername)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(friendship)
}

// POST /api/friends/respond
func (h *FriendHandler) Respond(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	var req models.FriendResponse
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	if err := h.svc.RespondToRequest(req.FriendshipID, userID, req.Accept); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /api/friends/:id
func (h *FriendHandler) Remove(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	friendshipID := c.Params("id")
	if err := h.svc.RemoveFriend(friendshipID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true})
}

// GET /api/friends
func (h *FriendHandler) List(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	friends, err := h.svc.ListFriends(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(friends)
}

// GET /api/friends/pending
func (h *FriendHandler) ListPending(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	pending, err := h.svc.ListPendingRequests(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(pending)
}
