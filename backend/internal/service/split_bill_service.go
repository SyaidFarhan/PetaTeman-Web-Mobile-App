package service

import (
	"github.com/peta/backend/internal/models"
	"github.com/peta/backend/internal/repository"
)

type SplitBillService struct {
	billRepo *repository.SplitBillRepository
}

func NewSplitBillService(br *repository.SplitBillRepository) *SplitBillService {
	return &SplitBillService{billRepo: br}
}

func (s *SplitBillService) CreateBill(creatorID string, req *models.CreateSplitBillRequest) (*models.SplitBill, error) {
	return s.billRepo.Create(creatorID, req)
}

func (s *SplitBillService) GetBill(id string) (*models.SplitBill, error) {
	return s.billRepo.GetByID(id)
}

func (s *SplitBillService) MarkPaid(billID, userID string) error {
	return s.billRepo.MarkPaid(billID, userID)
}

func (s *SplitBillService) ListHistory(userID string) ([]models.SplitBill, error) {
	return s.billRepo.ListByUser(userID)
}
