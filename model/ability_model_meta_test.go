package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/require"
)

func TestAddAbilitiesCreatesMissingModelMetadata(t *testing.T) {
	require.NoError(t, DB.AutoMigrate(&Model{}, &Vendor{}))
	require.NoError(t, DB.Exec("DELETE FROM abilities").Error)
	require.NoError(t, DB.Exec("DELETE FROM models").Error)
	require.NoError(t, DB.Exec("DELETE FROM vendors").Error)
	vendor := &Vendor{Name: "Anthropic", Status: 1}
	require.NoError(t, vendor.Insert())

	channel := &Channel{
		Id:     1001,
		Models: " claude-sonnet-5,claude-opus-4-8,claude-sonnet-5,, ",
		Group:  "Claude 官转 key",
		Status: common.ChannelStatusEnabled,
	}

	require.NoError(t, channel.AddAbilities(nil))

	var models []Model
	require.NoError(t, DB.Order("model_name").Find(&models).Error)
	require.Len(t, models, 2)
	require.Equal(t, "claude-opus-4-8", models[0].ModelName)
	require.Equal(t, vendor.Id, models[0].VendorID)
	require.Equal(t, 1, models[0].Status)
	require.Equal(t, 0, models[0].SyncOfficial)
	require.Equal(t, NameRuleExact, models[0].NameRule)
	require.Equal(t, "claude-sonnet-5", models[1].ModelName)
	require.Equal(t, vendor.Id, models[1].VendorID)

	var abilities []Ability
	require.NoError(t, DB.Order("model").Find(&abilities).Error)
	require.Len(t, abilities, 2)
	require.Equal(t, "claude-opus-4-8", abilities[0].Model)
	require.Equal(t, "Claude 官转 key", abilities[0].Group)
	require.Equal(t, "claude-sonnet-5", abilities[1].Model)
}

func TestAddAbilitiesDoesNotOverwriteExistingModelMetadata(t *testing.T) {
	require.NoError(t, DB.AutoMigrate(&Model{}, &Vendor{}))
	require.NoError(t, DB.Exec("DELETE FROM abilities").Error)
	require.NoError(t, DB.Exec("DELETE FROM models").Error)
	require.NoError(t, DB.Exec("DELETE FROM vendors").Error)
	require.NoError(t, DB.Model(&Model{}).Create(map[string]any{
		"model_name":    "claude-sonnet-5",
		"description":   "existing description",
		"status":        0,
		"sync_official": 1,
		"name_rule":     NameRuleContains,
	}).Error)

	channel := &Channel{
		Id:     1002,
		Models: "claude-sonnet-5",
		Group:  "default",
		Status: common.ChannelStatusEnabled,
	}

	require.NoError(t, channel.AddAbilities(nil))

	var modelMeta Model
	require.NoError(t, DB.First(&modelMeta, "model_name = ?", "claude-sonnet-5").Error)
	require.Equal(t, "existing description", modelMeta.Description)
	require.Equal(t, 0, modelMeta.Status)
	require.Equal(t, 1, modelMeta.SyncOfficial)
	require.Equal(t, NameRuleContains, modelMeta.NameRule)
}
