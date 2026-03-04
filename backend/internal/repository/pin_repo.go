package repository

import (
	"encoding/json"
	"fmt"

	"github.com/peta/backend/config"
	"github.com/peta/backend/internal/models"
	supa "github.com/supabase-community/supabase-go"
)

type PinRepository struct {
	client *supa.Client
}

func NewPinRepository() (*PinRepository, error) {
	client, err := supa.NewClient(config.App.SupabaseURL, config.App.SupabaseServiceRoleKey, &supa.ClientOptions{})
	if err != nil {
		return nil, err
	}
	return &PinRepository{client: client}, nil
}

func (r *PinRepository) Create(userID string, req *models.CreatePinRequest) (*models.Pin, error) {
	data := map[string]interface{}{
		"user_id":     userID,
		"latitude":    req.Latitude,
		"longitude":   req.Longitude,
		"title":       req.Title,
		"description": req.Description,
		"category":    req.Category,
	}
	if req.ExpiresAt != nil {
		data["expires_at"] = req.ExpiresAt
	}
	result, _, err := r.client.From("pins").Insert(data, false, "", "representation", "").Execute()
	if err != nil {
		return nil, err
	}
	var pins []models.Pin
	if err := json.Unmarshal(result, &pins); err != nil || len(pins) == 0 {
		return nil, fmt.Errorf("create pin failed")
	}
	return &pins[0], nil
}

func (r *PinRepository) Delete(id, userID string) error {
	_, _, err := r.client.From("pins").Delete("", "exact").Eq("id", id).Eq("user_id", userID).Execute()
	return err
}

// ListActive returns non-expired pins from the given user IDs
func (r *PinRepository) ListActive(userIDs []string) ([]models.Pin, error) {
	if len(userIDs) == 0 {
		return []models.Pin{}, nil
	}
	data, _, err := r.client.From("pins").
		Select("*,user:user_id(id,username,avatar_url)", "exact", false).
		In("user_id", userIDs).
		Or("expires_at.is.null,expires_at.gt.now()", "").Execute()
	if err != nil {
		return nil, err
	}
	var pins []models.Pin
	if err := json.Unmarshal(data, &pins); err != nil {
		return nil, err
	}
	return pins, nil
}

func (r *PinRepository) GetByID(id string) (*models.Pin, error) {
	data, _, err := r.client.From("pins").Select("*,user:user_id(id,username,avatar_url),reviews:pin_reviews(*,user:user_id(id,username,avatar_url))", "exact", false).Eq("id", id).Single().Execute()
	if err != nil {
		return nil, err
	}
	var pin models.Pin
	if err := json.Unmarshal(data, &pin); err != nil {
		return nil, err
	}
	return &pin, nil
}

func (r *PinRepository) AddReview(pinID, userID string, req *models.AddPinReviewRequest) (*models.PinReview, error) {
	data := map[string]interface{}{
		"pin_id":   pinID,
		"user_id":  userID,
		"comment":  req.Comment,
		"reaction": req.Reaction,
	}
	result, _, err := r.client.From("pin_reviews").Insert(data, false, "", "representation", "").Execute()
	if err != nil {
		return nil, err
	}
	var reviews []models.PinReview
	if err := json.Unmarshal(result, &reviews); err != nil || len(reviews) == 0 {
		return nil, fmt.Errorf("add review failed")
	}
	return &reviews[0], nil
}
