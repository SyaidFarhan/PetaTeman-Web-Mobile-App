package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/peta/backend/internal/handler"
	"github.com/peta/backend/internal/middleware"
)

func Setup(app *fiber.App, userH *handler.UserHandler, friendH *handler.FriendHandler, locH *handler.LocationHandler, pinH *handler.PinHandler, billH *handler.SplitBillHandler) {
	api := app.Group("/api", middleware.JWTAuth())

	// User / Profile
	api.Get("/me", userH.GetMe)
	api.Patch("/me", userH.UpdateMe)
	api.Post("/me/profile", userH.UpsertProfile)

	// Friends
	friends := api.Group("/friends")
	friends.Get("/search", friendH.Search)
	friends.Get("/", friendH.List)
	friends.Get("/pending", friendH.ListPending)
	friends.Post("/request", friendH.SendRequest)
	friends.Post("/respond", friendH.Respond)
	friends.Delete("/:id", friendH.Remove)

	// Location (REST)
	location := api.Group("/location")
	location.Post("/", locH.UpdateLocation)
	location.Get("/friends", locH.GetFriendsLocations)

	// WebSocket for real-time location (JWT checked via query param)
	app.Get("/api/ws", middleware.JWTAuth(), locH.WebSocketUpgrade, locH.WebSocketHandler())

	// Pins
	pins := api.Group("/pins")
	pins.Get("/", pinH.ListActive)
	pins.Post("/", pinH.Create)
	pins.Get("/:id", pinH.GetDetail)
	pins.Delete("/:id", pinH.Delete)
	pins.Post("/:id/reviews", pinH.AddReview)

	// Split Bills
	bills := api.Group("/bills")
	bills.Get("/", billH.ListHistory)
	bills.Post("/", billH.Create)
	bills.Get("/:id", billH.GetBill)
	bills.Post("/:id/pay", billH.MarkPaid)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})
}
