package service

import (
	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/repository"
)

type LocationService struct {
	locationRepo *repository.LocationRepository
	friendRepo   *repository.FriendshipRepository
}

func NewLocationService(lr *repository.LocationRepository, fr *repository.FriendshipRepository) *LocationService {
	return &LocationService{locationRepo: lr, friendRepo: fr}
}

func (s *LocationService) UpdateLocation(userID string, req *models.UpdateLocationRequest) (*models.UserLocation, error) {
	return s.locationRepo.Upsert(userID, req)
}

func (s *LocationService) GetFriendsLocations(userID string) ([]models.UserLocation, error) {
	friends, err := s.friendRepo.ListFriends(userID)
	if err != nil {
		return nil, err
	}
	var friendIDs []string
	for _, f := range friends {
		if f.RequesterID == userID {
			friendIDs = append(friendIDs, f.ReceiverID)
		} else {
			friendIDs = append(friendIDs, f.RequesterID)
		}
	}
	return s.locationRepo.GetFriendsLocations(friendIDs)
}
