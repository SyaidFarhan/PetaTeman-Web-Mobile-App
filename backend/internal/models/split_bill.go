package models

import "time"

type SplitBill struct {
	ID           string                 `json:"id"`
	CreatorID    string                 `json:"creator_id"`
	Title        string                 `json:"title"`
	TotalAmount  float64                `json:"total_amount"`
	CreatedAt    time.Time              `json:"created_at"`
	Creator      *User                  `json:"creator,omitempty"`
	Participants []SplitBillParticipant `json:"participants,omitempty"`
}

type SplitBillParticipant struct {
	ID         string     `json:"id"`
	BillID     string     `json:"bill_id"`
	UserID     string     `json:"user_id"`
	AmountOwed float64    `json:"amount_owed"`
	IsPaid     bool       `json:"is_paid"`
	PaidAt     *time.Time `json:"paid_at,omitempty"`
	User       *User      `json:"user,omitempty"`
}

type CreateSplitBillRequest struct {
	Title        string                   `json:"title"`
	TotalAmount  float64                  `json:"total_amount"`
	Participants []ParticipantAmountInput `json:"participants"`
}

type ParticipantAmountInput struct {
	UserID     string  `json:"user_id"`
	AmountOwed float64 `json:"amount_owed"`
}
