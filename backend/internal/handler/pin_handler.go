package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/peta/backend/internal/middleware"
	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/service"
)

type PinHandler struct {
	svc *service.PinService
}

func NewPinHandler(svc *service.PinService) *PinHandler {
	return &PinHandler{svc: svc}
}

// GET /api/pins — list active pins visible to user (own + friends)
func (h *PinHandler) ListActive(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	pins, err := h.svc.ListActivePinsForUser(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(pins)
}

// POST /api/pins
func (h *PinHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	var req models.CreatePinRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	pin, err := h.svc.CreatePin(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(pin)
}

// GET /api/pins/:id
func (h *PinHandler) GetDetail(c *fiber.Ctx) error {
	pin, err := h.svc.GetPinDetail(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "pin not found"})
	}
	return c.JSON(pin)
}

// DELETE /api/pins/:id
func (h *PinHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if err := h.svc.DeletePin(c.Params("id"), userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true})
}

// POST /api/pins/:id/reviews
func (h *PinHandler) AddReview(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	var req models.AddPinReviewRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	review, err := h.svc.AddReview(c.Params("id"), userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(review)
}
