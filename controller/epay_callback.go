package controller

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/Calcium-Ion/go-epay/epay"
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
)

func collectEpayParams(c *gin.Context) (map[string]string, error) {
	if c.Request.Method == http.MethodPost {
		if err := c.Request.ParseForm(); err != nil {
			return nil, err
		}
		return lo.Reduce(lo.Keys(c.Request.PostForm), func(r map[string]string, t string, i int) map[string]string {
			r[t] = c.Request.PostForm.Get(t)
			return r
		}, map[string]string{}), nil
	}

	return lo.Reduce(lo.Keys(c.Request.URL.Query()), func(r map[string]string, t string, i int) map[string]string {
		r[t] = c.Request.URL.Query().Get(t)
		return r
	}, map[string]string{}), nil
}

func completeEpayTopup(c *gin.Context, verifyInfo *epay.VerifyRes) error {
	LockOrder(verifyInfo.ServiceTradeNo)
	defer UnlockOrder(verifyInfo.ServiceTradeNo)

	topUp := model.GetTopUpByTradeNo(verifyInfo.ServiceTradeNo)
	if topUp == nil {
		return model.ErrTopUpNotFound
	}
	if topUp.PaymentProvider != model.PaymentProviderEpay {
		return model.ErrPaymentMethodMismatch
	}

	err := model.CompleteTopUp(verifyInfo.ServiceTradeNo, model.PaymentProviderEpay, verifyInfo.Type)
	if err != nil && !errors.Is(err, model.ErrTopUpStatusInvalid) {
		return err
	}

	updatedTopUp := model.GetTopUpByTradeNo(verifyInfo.ServiceTradeNo)
	if updatedTopUp != nil {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("epay topup completed trade_no=%s user_id=%d money=%.2f payment_method=%s", updatedTopUp.TradeNo, updatedTopUp.UserId, updatedTopUp.Money, updatedTopUp.PaymentMethod))
	}
	return nil
}

func EpayNotifyHandler(c *gin.Context) {
	if !isEpayWebhookEnabled() {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("epay webhook rejected path=%q client_ip=%s reason=webhook_disabled", c.Request.RequestURI, c.ClientIP()))
		_, _ = c.Writer.Write([]byte("fail"))
		return
	}

	params, err := collectEpayParams(c)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("epay webhook parse failed path=%q client_ip=%s error=%q", c.Request.RequestURI, c.ClientIP(), err.Error()))
		_, _ = c.Writer.Write([]byte("fail"))
		return
	}
	if len(params) == 0 {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("epay webhook empty params path=%q client_ip=%s", c.Request.RequestURI, c.ClientIP()))
		_, _ = c.Writer.Write([]byte("fail"))
		return
	}

	client := GetEpayClient()
	if client == nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("epay webhook client missing path=%q client_ip=%s", c.Request.RequestURI, c.ClientIP()))
		_, _ = c.Writer.Write([]byte("fail"))
		return
	}

	verifyInfo, err := client.Verify(params)
	if err != nil || !verifyInfo.VerifyStatus {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("epay webhook verify failed path=%q client_ip=%s error=%q", c.Request.RequestURI, c.ClientIP(), err))
		_, _ = c.Writer.Write([]byte("fail"))
		return
	}

	if verifyInfo.TradeStatus != epay.StatusTradeSuccess {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("epay webhook ignored trade_no=%s trade_status=%s", verifyInfo.ServiceTradeNo, verifyInfo.TradeStatus))
		_, _ = c.Writer.Write([]byte("success"))
		return
	}

	if err := completeEpayTopup(c, verifyInfo); err != nil && !errors.Is(err, model.ErrTopUpStatusInvalid) {
		logger.LogError(c.Request.Context(), fmt.Sprintf("epay webhook complete failed trade_no=%s client_ip=%s error=%q payload=%q", verifyInfo.ServiceTradeNo, c.ClientIP(), err.Error(), common.GetJsonString(verifyInfo)))
		_, _ = c.Writer.Write([]byte("fail"))
		return
	}

	_, _ = c.Writer.Write([]byte("success"))
}

func EpayReturnHandler(c *gin.Context) {
	params, err := collectEpayParams(c)
	if err == nil && len(params) > 0 {
		client := GetEpayClient()
		if client != nil {
			verifyInfo, verifyErr := client.Verify(params)
			if verifyErr == nil && verifyInfo.VerifyStatus && verifyInfo.TradeStatus == epay.StatusTradeSuccess {
				if err := completeEpayTopup(c, verifyInfo); err != nil && !errors.Is(err, model.ErrTopUpStatusInvalid) {
					logger.LogWarn(c.Request.Context(), fmt.Sprintf("epay return complete failed trade_no=%s client_ip=%s error=%q", verifyInfo.ServiceTradeNo, c.ClientIP(), err.Error()))
				}
			}
		}
	}

	c.Redirect(http.StatusFound, service.GetPaymentResultURL(true))
}
