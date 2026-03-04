package models

import "time"

type UserLocation struct {
	ID               string    `json:"id"`
	UserID           string    `json:"user_id"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	IsRealtimeActive bool      `json:"is_realtime_active"`
	LastActiveAt     time.Time `json:"last_active_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	// Populated via join
	User *User `json:"user,omitempty"`
}

type UpdateLocationRequest struct {
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	IsRealtimeActive bool    `json:"is_realtime_active"`
}

// LocationUpdate is the WebSocket message payload
type LocationUpdate struct {
	UserID           string    `json:"user_id"`
	Username         string    `json:"username"`
	AvatarURL        string    `json:"avatar_url"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	IsRealtimeActive bool      `json:"is_realtime_active"`
	LocationMode     string    `json:"location_mode"`
	LastActiveAt     time.Time `json:"last_active_at"`
}
