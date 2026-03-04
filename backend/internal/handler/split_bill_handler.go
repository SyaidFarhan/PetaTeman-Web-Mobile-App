package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/peta/backend/internal/middleware"
	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/service"
)

type SplitBillHandler struct {
	svc *service.SplitBillService
}

func NewSplitBillHandler(svc *service.SplitBillService) *SplitBillHandler {
	return &SplitBillHandler{svc: svc}
}

// GET /api/bills
func (h *SplitBillHandler) ListHistory(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	bills, err := h.svc.ListHistory(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(bills)
}

// POST /api/bills
func (h *SplitBillHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	var req models.CreateSplitBillRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	bill, err := h.svc.CreateBill(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(bill)
}

// GET /api/bills/:id
func (h *SplitBillHandler) GetBill(c *fiber.Ctx) error {
	bill, err := h.svc.GetBill(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "bill not found"})
	}
	return c.JSON(bill)
}

// POST /api/bills/:id/pay
func (h *SplitBillHandler) MarkPaid(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if err := h.svc.MarkPaid(c.Params("id"), userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true})
}
