package repository

import (
	"encoding/json"
	"fmt"

	"github.com/peta/backend/config"
	"github.com/peta/backend/internal/models"
	supa "github.com/supabase-community/supabase-go"
)

type UserRepository struct {
	client *supa.Client
}

func NewUserRepository() (*UserRepository, error) {
	client, err := supa.NewClient(config.App.SupabaseURL, config.App.SupabaseServiceRoleKey, &supa.ClientOptions{})
	if err != nil {
		return nil, err
	}
	return &UserRepository{client: client}, nil
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
	data, _, err := r.client.From("users").Select("*", "exact", false).Eq("id", id).Single().Execute()
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	var user models.User
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	data, _, err := r.client.From("users").Select("*", "exact", false).Eq("username", username).Single().Execute()
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	var user models.User
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Upsert(user *models.User) error {
	data := map[string]interface{}{
		"id":            user.ID,
		"username":      user.Username,
		"avatar_url":    user.AvatarURL,
		"location_mode": string(user.LocationMode),
	}
	_, _, err := r.client.From("users").Upsert(data, "", "*", "").Execute()
	return err
}

func (r *UserRepository) Update(id string, req *models.UpdateUserRequest) (*models.User, error) {
	data := map[string]interface{}{}
	if req.Username != "" {
		data["username"] = req.Username
	}
	if req.AvatarURL != "" {
		data["avatar_url"] = req.AvatarURL
	}
	if req.LocationMode != "" {
		data["location_mode"] = string(req.LocationMode)
	}
	result, _, err := r.client.From("users").Update(data, "representation", "").Eq("id", id).Execute()
	if err != nil {
		return nil, err
	}
	var users []models.User
	if err := json.Unmarshal(result, &users); err != nil || len(users) == 0 {
		return nil, fmt.Errorf("update failed")
	}
	return &users[0], nil
}

func (r *UserRepository) SearchByUsername(query string) ([]models.User, error) {
	data, _, err := r.client.From("users").Select("id,username,avatar_url", "exact", false).
		Like("username", "%"+query+"%").Limit(20, "").Execute()
	if err != nil {
		return nil, err
	}
	var users []models.User
	if err := json.Unmarshal(data, &users); err != nil {
		return nil, err
	}
	return users, nil
}
