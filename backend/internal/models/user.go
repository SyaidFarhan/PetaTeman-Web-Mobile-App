package models

import (
	"time"
)

type LocationMode string

const (
	LocationModeRealtime LocationMode = "realtime"
	LocationModePaused   LocationMode = "paused"
	LocationModeGhost    LocationMode = "ghost"
)

type User struct {
	ID           string       `json:"id"`
	Username     string       `json:"username"`
	Email        string       `json:"email,omitempty"`
	AvatarURL    string       `json:"avatar_url,omitempty"`
	LocationMode LocationMode `json:"location_mode"`
	CreatedAt    time.Time    `json:"created_at"`
}

type UpdateUserRequest struct {
	Username     string       `json:"username,omitempty"`
	AvatarURL    string       `json:"avatar_url,omitempty"`
	LocationMode LocationMode `json:"location_mode,omitempty"`
}
