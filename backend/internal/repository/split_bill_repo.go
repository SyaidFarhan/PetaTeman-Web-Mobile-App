package repository

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/peta/backend/config"
	"github.com/peta/backend/internal/models"
	supa "github.com/supabase-community/supabase-go"
)

type SplitBillRepository struct {
	client *supa.Client
}

func NewSplitBillRepository() (*SplitBillRepository, error) {
	client, err := supa.NewClient(config.App.SupabaseURL, config.App.SupabaseServiceRoleKey, &supa.ClientOptions{})
	if err != nil {
		return nil, err
	}
	return &SplitBillRepository{client: client}, nil
}

func (r *SplitBillRepository) Create(creatorID string, req *models.CreateSplitBillRequest) (*models.SplitBill, error) {
	data := map[string]interface{}{
		"creator_id":   creatorID,
		"title":        req.Title,
		"total_amount": req.TotalAmount,
	}
	result, _, err := r.client.From("split_bills").Insert(data, false, "", "representation", "").Execute()
	if err != nil {
		return nil, err
	}
	var bills []models.SplitBill
	if err := json.Unmarshal(result, &bills); err != nil || len(bills) == 0 {
		return nil, fmt.Errorf("create bill failed")
	}
	bill := &bills[0]

	// Insert participants
	for _, p := range req.Participants {
		pData := map[string]interface{}{
			"bill_id":     bill.ID,
			"user_id":     p.UserID,
			"amount_owed": p.AmountOwed,
		}
		_, _, err := r.client.From("split_bill_participants").Insert(pData, false, "", "minimal", "").Execute()
		if err != nil {
			return nil, fmt.Errorf("add participant failed: %w", err)
		}
	}

	return r.GetByID(bill.ID)
}

func (r *SplitBillRepository) GetByID(id string) (*models.SplitBill, error) {
	data, _, err := r.client.From("split_bills").
		Select("*,creator:creator_id(id,username,avatar_url),participants:split_bill_participants(*,user:user_id(id,username,avatar_url))", "exact", false).
		Eq("id", id).Single().Execute()
	if err != nil {
		return nil, err
	}
	var bill models.SplitBill
	if err := json.Unmarshal(data, &bill); err != nil {
		return nil, err
	}
	return &bill, nil
}

func (r *SplitBillRepository) MarkPaid(billID, userID string) error {
	now := time.Now().UTC()
	data := map[string]interface{}{
		"is_paid": true,
		"paid_at": now,
	}
	_, _, err := r.client.From("split_bill_participants").
		Update(data, "*", "exact").
		Eq("bill_id", billID).
		Eq("user_id", userID).
		Execute()
	return err
}

func (r *SplitBillRepository) ListByUser(userID string) ([]models.SplitBill, error) {
	// Bills where user is creator or participant
	participantData, _, err := r.client.From("split_bill_participants").
		Select("bill_id", "exact", false).Eq("user_id", userID).Execute()
	if err != nil {
		return nil, err
	}
	var participants []map[string]string
	json.Unmarshal(participantData, &participants)

	billIDs := []string{userID} // placeholder; we use creator OR participant
	for _, p := range participants {
		billIDs = append(billIDs, p["bill_id"])
	}

	data, _, err := r.client.From("split_bills").
		Select("*,creator:creator_id(id,username,avatar_url),participants:split_bill_participants(*,user:user_id(id,username,avatar_url))", "exact", false).
		Or(fmt.Sprintf("creator_id.eq.%s,id.in.(%s)", userID, joinIDs(billIDs)), "").Execute()
	if err != nil {
		return nil, err
	}
	var bills []models.SplitBill
	if err := json.Unmarshal(data, &bills); err != nil {
		return nil, err
	}
	return bills, nil
}

func joinIDs(ids []string) string {
	result := ""
	for i, id := range ids {
		if i > 0 {
			result += ","
		}
		result += id
	}
	return result
}
