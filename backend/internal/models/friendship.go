package models

import "time"

type FriendshipStatus string

const (
	StatusPending  FriendshipStatus = "pending"
	StatusAccepted FriendshipStatus = "accepted"
	StatusRejected FriendshipStatus = "rejected"
)

type Friendship struct {
	ID          string           `json:"id"`
	RequesterID string           `json:"requester_id"`
	ReceiverID  string           `json:"receiver_id"`
	Status      FriendshipStatus `json:"status"`
	CreatedAt   time.Time        `json:"created_at"`
	// Populated via join
	Requester *User `json:"requester,omitempty"`
	Receiver  *User `json:"receiver,omitempty"`
}

type FriendRequest struct {
	ReceiverUsername string `json:"receiver_username"`
}

type FriendResponse struct {
	FriendshipID string `json:"friendship_id"`
	Accept       bool   `json:"accept"`
}
