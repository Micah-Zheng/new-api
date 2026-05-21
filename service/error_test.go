package service

import (
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/types"
	"github.com/stretchr/testify/require"
)

func TestResetStatusCode(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name             string
		statusCode       int
		statusCodeConfig string
		expectedCode     int
	}{
		{
			name:             "map string value",
			statusCode:       429,
			statusCodeConfig: `{"429":"503"}`,
			expectedCode:     503,
		},
		{
			name:             "map int value",
			statusCode:       429,
			statusCodeConfig: `{"429":503}`,
			expectedCode:     503,
		},
		{
			name:             "skip invalid string value",
			statusCode:       429,
			statusCodeConfig: `{"429":"bad-code"}`,
			expectedCode:     429,
		},
		{
			name:             "skip status code 200",
			statusCode:       200,
			statusCodeConfig: `{"200":503}`,
			expectedCode:     200,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			newAPIError := &types.NewAPIError{
				StatusCode: tc.statusCode,
			}
			ResetStatusCode(newAPIError, tc.statusCodeConfig)
			require.Equal(t, tc.expectedCode, newAPIError.StatusCode)
		})
	}
}

func TestRelayErrorHandlerReturnsNonJSONUpstreamBodySummary(t *testing.T) {
	t.Parallel()

	resp := &http.Response{
		StatusCode: http.StatusBadGateway,
		Body: io.NopCloser(strings.NewReader(`<!doctype html>
<html><head><title>系统维护中</title><style>body{}</style></head>
<body><h1>系统升级中，请稍候</h1><p>我们正在进行版本更新，预计 1-2 分钟内恢复。</p></body></html>`)),
	}

	newAPIError := RelayErrorHandler(t.Context(), resp, false)
	require.NotNil(t, newAPIError)
	require.Equal(t, http.StatusBadGateway, newAPIError.StatusCode)

	openAIError := newAPIError.ToOpenAIError()
	require.Contains(t, openAIError.Message, "bad response status code 502")
	require.Contains(t, openAIError.Message, "系统升级中，请稍候")
	require.Contains(t, openAIError.Message, "预计 1-2 分钟内恢复")
	require.NotContains(t, openAIError.Message, "<html>")
	require.NotEqual(t, "openai_error", openAIError.Message)
}
