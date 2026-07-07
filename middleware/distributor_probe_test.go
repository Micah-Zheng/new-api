package middleware

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestIsOneTokenProbeRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)

	newJSONContext := func(t *testing.T, body string) *gin.Context {
		t.Helper()

		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		c.Request = httptest.NewRequest(http.MethodPost, "/v1/chat/completions", bytes.NewBufferString(body))
		c.Request.Header.Set("Content-Type", "application/json")
		return c
	}

	tests := []struct {
		name string
		body string
		want bool
	}{
		{
			name: "openai max_tokens one rejected",
			body: `{"model":"gpt-4o","messages":[{"role":"user","content":"hi"}],"max_tokens":1}`,
			want: true,
		},
		{
			name: "openai max_completion_tokens one rejected",
			body: `{"model":"gpt-4o","messages":[{"role":"user","content":"hi"}],"max_completion_tokens":1}`,
			want: true,
		},
		{
			name: "responses max_output_tokens one rejected",
			body: `{"model":"gpt-4o","input":"hi","max_output_tokens":1}`,
			want: true,
		},
		{
			name: "claude max_tokens_to_sample one rejected",
			body: `{"model":"claude-sonnet-4","messages":[{"role":"user","content":"hi"}],"max_tokens_to_sample":1}`,
			want: true,
		},
		{
			name: "gemini maxOutputTokens one rejected",
			body: `{"contents":[{"parts":[{"text":"hi"}]}],"generationConfig":{"maxOutputTokens":1}}`,
			want: true,
		},
		{
			name: "missing max tokens accepted",
			body: `{"model":"gpt-4o","messages":[{"role":"user","content":"hi"}]}`,
			want: false,
		},
		{
			name: "max tokens above one accepted",
			body: `{"model":"gpt-4o","messages":[{"role":"user","content":"hi"}],"max_tokens":2}`,
			want: false,
		},
		{
			name: "string one is not treated as numeric probe",
			body: `{"model":"gpt-4o","messages":[{"role":"user","content":"hi"}],"max_tokens":"1"}`,
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.Equal(t, tt.want, isOneTokenProbeRequest(newJSONContext(t, tt.body)))
		})
	}
}
