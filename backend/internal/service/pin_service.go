package service

import (
	"errors"

	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/repository"
)

type PinService struct {
	pinRepo    *repository.PinRepository
	friendRepo *repository.FriendshipRepository
}

func NewPinService(pr *repository.PinRepository, fr *repository.FriendshipRepository) *PinService {
	return &PinService{pinRepo: pr, friendRepo: fr}
}

func (s *PinService) CreatePin(userID string, req *models.CreatePinRequest) (*models.Pin, error) {
	if req.Title == "" {
		return nil, errors.New("title is required")
	}
	return s.pinRepo.Create(userID, req)
}

func (s *PinService) DeletePin(pinID, userID string) error {
	return s.pinRepo.Delete(pinID, userID)
}

func (s *PinService) GetPinDetail(pinID string) (*models.Pin, error) {
	return s.pinRepo.GetByID(pinID)
}

func (s *PinService) ListActivePinsForUser(userID string) ([]models.Pin, error) {
	friends, err := s.friendRepo.ListFriends(userID)
	if err != nil {
		return nil, err
	}
	userIDs := []string{userID}
	for _, f := range friends {
		if f.RequesterID == userID {
			userIDs = append(userIDs, f.ReceiverID)
		} else {
			userIDs = append(userIDs, f.RequesterID)
		}
	}
	return s.pinRepo.ListActive(userIDs)
}

func (s *PinService) AddReview(pinID, userID string, req *models.AddPinReviewRequest) (*models.PinReview, error) {
	return s.pinRepo.AddReview(pinID, userID, req)
}
