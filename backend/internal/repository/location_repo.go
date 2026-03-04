package repository

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/peta/backend/config"
	"github.com/peta/backend/internal/models"
	supa "github.com/supabase-community/supabase-go"
)

type LocationRepository struct {
	client *supa.Client
}

func NewLocationRepository() (*LocationRepository, error) {
	client, err := supa.NewClient(config.App.SupabaseURL, config.App.SupabaseServiceRoleKey, &supa.ClientOptions{})
	if err != nil {
		return nil, err
	}
	return &LocationRepository{client: client}, nil
}

func (r *LocationRepository) Upsert(userID string, req *models.UpdateLocationRequest) (*models.UserLocation, error) {
	now := time.Now().UTC()
	data := map[string]interface{}{
		"user_id":            userID,
		"latitude":           req.Latitude,
		"longitude":          req.Longitude,
		"is_realtime_active": req.IsRealtimeActive,
		"updated_at":         now,
	}
	if req.IsRealtimeActive {
		data["last_active_at"] = now
	}
	result, _, err := r.client.From("user_locations").Upsert(data, "user_id", "representation", "").Execute()
	if err != nil {
		return nil, err
	}
	var locs []models.UserLocation
	if err := json.Unmarshal(result, &locs); err != nil || len(locs) == 0 {
		return nil, fmt.Errorf("upsert failed")
	}
	return &locs[0], nil
}

func (r *LocationRepository) GetByUserID(userID string) (*models.UserLocation, error) {
	data, _, err := r.client.From("user_locations").Select("*", "exact", false).Eq("user_id", userID).Single().Execute()
	if err != nil {
		return nil, err
	}
	var loc models.UserLocation
	if err := json.Unmarshal(data, &loc); err != nil {
		return nil, err
	}
	return &loc, nil
}

// GetFriendsLocations returns locations of accepted friends (excluding ghost mode)
func (r *LocationRepository) GetFriendsLocations(friendIDs []string) ([]models.UserLocation, error) {
	if len(friendIDs) == 0 {
		return []models.UserLocation{}, nil
	}
	// Build IN filter
	inFilter := "("
	for i, id := range friendIDs {
		if i > 0 {
			inFilter += ","
		}
		inFilter += id
	}
	inFilter += ")"

	data, _, err := r.client.From("user_locations").
		Select("*,user:user_id(id,username,avatar_url,location_mode)", "exact", false).
		In("user_id", friendIDs).Execute()
	if err != nil {
		return nil, err
	}
	var locs []models.UserLocation
	if err := json.Unmarshal(data, &locs); err != nil {
		return nil, err
	}
	return locs, nil
}
