package service

import (
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/QuantumNous/new-api/setting/system_setting"
)

func GetCallbackAddress() string {
	if operation_setting.CustomCallbackAddress == "" {
		return system_setting.ServerAddress
	}
	return operation_setting.CustomCallbackAddress
}

func GetPaymentResultPath() string {
	if common.GetTheme() == "classic" {
		return "/console/topup"
	}
	return "/wallet"
}

func GetPaymentResultURL(showHistory bool) string {
	base := strings.TrimRight(system_setting.ServerAddress, "/")
	path := GetPaymentResultPath()
	if showHistory {
		return base + path + "?show_history=true"
	}
	return base + path
}
