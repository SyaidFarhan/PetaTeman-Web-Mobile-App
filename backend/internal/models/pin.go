package models

import "time"

type Pin struct {
	ID          string     `json:"id"`
	UserID      string     `json:"user_id"`
	Latitude    float64    `json:"latitude"`
	Longitude   float64    `json:"longitude"`
	Title       string     `json:"title"`
	Description string     `json:"description,omitempty"`
	Category    string     `json:"category,omitempty"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	// Populated
	User    *User       `json:"user,omitempty"`
	Reviews []PinReview `json:"reviews,omitempty"`
}

type PinReview struct {
	ID        string    `json:"id"`
	PinID     string    `json:"pin_id"`
	UserID    string    `json:"user_id"`
	Comment   string    `json:"comment,omitempty"`
	Reaction  string    `json:"reaction,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	User      *User     `json:"user,omitempty"`
}

type CreatePinRequest struct {
	Latitude    float64    `json:"latitude"`
	Longitude   float64    `json:"longitude"`
	Title       string     `json:"title"`
	Description string     `json:"description,omitempty"`
	Category    string     `json:"category,omitempty"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
}

type AddPinReviewRequest struct {
	Comment  string `json:"comment,omitempty"`
	Reaction string `json:"reaction,omitempty"`
}
