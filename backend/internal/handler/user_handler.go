package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/peta/backend/internal/middleware"
	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/repository"
)

type UserHandler struct {
	userRepo *repository.UserRepository
}

func NewUserHandler(ur *repository.UserRepository) *UserHandler {
	return &UserHandler{userRepo: ur}
}

// GET /api/me
func (h *UserHandler) GetMe(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	user, err := h.userRepo.GetByID(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user profile not found"})
	}
	return c.JSON(user)
}

// PATCH /api/me
func (h *UserHandler) UpdateMe(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	var req models.UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	user, err := h.userRepo.Update(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(user)
}

// POST /api/me/profile — Upsert user profile (called after Supabase auth sign-up)
func (h *UserHandler) UpsertProfile(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	user.ID = userID
	if user.LocationMode == "" {
		user.LocationMode = models.LocationModeRealtime
	}
	if err := h.userRepo.Upsert(&user); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return h.GetMe(c)
}
