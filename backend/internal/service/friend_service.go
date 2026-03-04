package service

import (
	"errors"

	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/repository"
)

type FriendService struct {
	friendRepo *repository.FriendshipRepository
	userRepo   *repository.UserRepository
}

func NewFriendService(fr *repository.FriendshipRepository, ur *repository.UserRepository) *FriendService {
	return &FriendService{friendRepo: fr, userRepo: ur}
}

func (s *FriendService) SearchUsers(query string) ([]models.User, error) {
	return s.userRepo.SearchByUsername(query)
}

func (s *FriendService) SendRequest(requesterID, receiverUsername string) (*models.Friendship, error) {
	receiver, err := s.userRepo.GetByUsername(receiverUsername)
	if err != nil {
		return nil, errors.New("user not found")
	}
	if requesterID == receiver.ID {
		return nil, errors.New("cannot send request to yourself")
	}
	return s.friendRepo.Create(requesterID, receiver.ID)
}

func (s *FriendService) RespondToRequest(friendshipID, receiverID string, accept bool) error {
	f, err := s.friendRepo.GetByID(friendshipID)
	if err != nil {
		return errors.New("friendship not found")
	}
	if f.ReceiverID != receiverID {
		return errors.New("unauthorized")
	}
	if f.Status != models.StatusPending {
		return errors.New("request already responded")
	}
	status := models.StatusRejected
	if accept {
		status = models.StatusAccepted
	}
	return s.friendRepo.UpdateStatus(friendshipID, status)
}

func (s *FriendService) RemoveFriend(friendshipID, userID string) error {
	return s.friendRepo.Delete(friendshipID, userID)
}

func (s *FriendService) ListFriends(userID string) ([]models.Friendship, error) {
	return s.friendRepo.ListFriends(userID)
}

func (s *FriendService) ListPendingRequests(userID string) ([]models.Friendship, error) {
	return s.friendRepo.ListPending(userID)
}

// GetFriendIDs returns accepted friend user IDs for a given user
func (s *FriendService) GetFriendIDs(userID string) ([]string, error) {
	friends, err := s.friendRepo.ListFriends(userID)
	if err != nil {
		return nil, err
	}
	var ids []string
	for _, f := range friends {
		if f.RequesterID == userID {
			ids = append(ids, f.ReceiverID)
		} else {
			ids = append(ids, f.RequesterID)
		}
	}
	return ids, nil
}
