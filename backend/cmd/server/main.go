package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/peta/backend/config"
	"github.com/peta/backend/internal/handler"
	"github.com/peta/backend/internal/repository"
	"github.com/peta/backend/internal/router"
	"github.com/peta/backend/internal/service"
)

func main() {
	// Load config
	config.Load()

	// Initialize Repositories
	userRepo, err := repository.NewUserRepository()
	if err != nil {
		log.Fatalf("failed to init user repo: %v", err)
	}
	friendRepo, err := repository.NewFriendshipRepository()
	if err != nil {
		log.Fatalf("failed to init friendship repo: %v", err)
	}
	locationRepo, err := repository.NewLocationRepository()
	if err != nil {
		log.Fatalf("failed to init location repo: %v", err)
	}
	pinRepo, err := repository.NewPinRepository()
	if err != nil {
		log.Fatalf("failed to init pin repo: %v", err)
	}
	billRepo, err := repository.NewSplitBillRepository()
	if err != nil {
		log.Fatalf("failed to init split bill repo: %v", err)
	}

	// Initialize Services
	friendSvc := service.NewFriendService(friendRepo, userRepo)
	locationSvc := service.NewLocationService(locationRepo, friendRepo)
	pinSvc := service.NewPinService(pinRepo, friendRepo)
	billSvc := service.NewSplitBillService(billRepo)

	// Initialize Handlers
	userH := handler.NewUserHandler(userRepo)
	friendH := handler.NewFriendHandler(friendSvc)
	locationH := handler.NewLocationHandler(locationSvc, friendSvc)
	pinH := handler.NewPinHandler(pinSvc)
	billH := handler.NewSplitBillHandler(billSvc)

	// Setup Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Peta API v1.0",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: config.App.AllowedOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PATCH, DELETE, OPTIONS",
	}))

	// Routes
	router.Setup(app, userH, friendH, locationH, pinH, billH)

	log.Printf("🚀 Peta API server starting on :%s", config.App.Port)
	if err := app.Listen(":" + config.App.Port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
