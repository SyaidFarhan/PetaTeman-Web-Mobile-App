package repository

import (
	"encoding/json"
	"fmt"

	"github.com/peta/backend/config"
	"github.com/peta/backend/internal/models"
	supa "github.com/supabase-community/supabase-go"
)

type FriendshipRepository struct {
	client *supa.Client
}

func NewFriendshipRepository() (*FriendshipRepository, error) {
	client, err := supa.NewClient(config.App.SupabaseURL, config.App.SupabaseServiceRoleKey, &supa.ClientOptions{})
	if err != nil {
		return nil, err
	}
	return &FriendshipRepository{client: client}, nil
}

func (r *FriendshipRepository) Create(requesterID, receiverID string) (*models.Friendship, error) {
	data := map[string]interface{}{
		"requester_id": requesterID,
		"receiver_id":  receiverID,
		"status":       "pending",
	}
	result, _, err := r.client.From("friendships").Insert(data, false, "", "representation", "").Execute()
	if err != nil {
		return nil, err
	}
	var friendships []models.Friendship
	if err := json.Unmarshal(result, &friendships); err != nil || len(friendships) == 0 {
		return nil, fmt.Errorf("create failed")
	}
	return &friendships[0], nil
}

func (r *FriendshipRepository) UpdateStatus(id string, status models.FriendshipStatus) error {
	data := map[string]interface{}{"status": string(status)}
	_, _, err := r.client.From("friendships").Update(data, "*", "exact").Eq("id", id).Execute()
	return err
}

func (r *FriendshipRepository) Delete(id string, userID string) error {
	// Only allow deletion if user is part of friendship
	_, _, err := r.client.From("friendships").Delete("", "exact").Eq("id", id).
		Or(fmt.Sprintf("requester_id.eq.%s,receiver_id.eq.%s", userID, userID), "").Execute()
	return err
}

func (r *FriendshipRepository) ListFriends(userID string) ([]models.Friendship, error) {
	data, _, err := r.client.From("friendships").
		Select("*,requester:requester_id(id,username,avatar_url),receiver:receiver_id(id,username,avatar_url)", "exact", false).
		Eq("status", "accepted").
		Or(fmt.Sprintf("requester_id.eq.%s,receiver_id.eq.%s", userID, userID), "").Execute()
	if err != nil {
		return nil, err
	}
	var list []models.Friendship
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *FriendshipRepository) ListPending(userID string) ([]models.Friendship, error) {
	data, _, err := r.client.From("friendships").
		Select("*,requester:requester_id(id,username,avatar_url)", "exact", false).
		Eq("receiver_id", userID).Eq("status", "pending").Execute()
	if err != nil {
		return nil, err
	}
	var list []models.Friendship
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *FriendshipRepository) GetByID(id string) (*models.Friendship, error) {
	data, _, err := r.client.From("friendships").Select("*", "exact", false).Eq("id", id).Single().Execute()
	if err != nil {
		return nil, err
	}
	var f models.Friendship
	if err := json.Unmarshal(data, &f); err != nil {
		return nil, err
	}
	return &f, nil
}

// AreFriends checks if two users have an accepted friendship
func (r *FriendshipRepository) AreFriends(userA, userB string) (bool, error) {
	data, _, err := r.client.From("friendships").Select("id", "exact", false).
		Eq("status", "accepted").
		Or(fmt.Sprintf("and(requester_id.eq.%s,receiver_id.eq.%s),and(requester_id.eq.%s,receiver_id.eq.%s)",
			userA, userB, userB, userA), "").Execute()
	if err != nil {
		return false, err
	}
	var list []map[string]interface{}
	json.Unmarshal(data, &list)
	return len(list) > 0, nil
}
