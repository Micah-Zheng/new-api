package helper

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	relayconstant "github.com/QuantumNous/new-api/relay/constant"
	"github.com/QuantumNous/new-api/types"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

// TestGetAndValidOpenAIImageRequestMultipartStream verifies multipart image
// edit parsing: the stream field is parsed and validated, and the request body
// stays replayable for the upstream request.
func TestGetAndValidOpenAIImageRequestMultipartStream(t *testing.T) {
	gin.SetMode(gin.TestMode)

	newContext := func(t *testing.T, streamValue string, withImage bool) (*gin.Context, string) {
		var body bytes.Buffer
		writer := multipart.NewWriter(&body)
		require.NoError(t, writer.WriteField("model", "gpt-image-1"))
		require.NoError(t, writer.WriteField("prompt", "edit this image"))
		require.NoError(t, writer.WriteField("stream", streamValue))
		if withImage {
			part, err := writer.CreateFormFile("image", "input.png")
			require.NoError(t, err)
			_, err = part.Write([]byte("fake image"))
			require.NoError(t, err)
		}
		require.NoError(t, writer.Close())
		originalBody := body.String()

		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		c.Request = httptest.NewRequest(http.MethodPost, "/v1/images/edits", &body)
		c.Request.Header.Set("Content-Type", writer.FormDataContentType())
		return c, originalBody
	}

	t.Run("valid stream value keeps body replayable", func(t *testing.T) {
		c, originalBody := newContext(t, "true", true)

		req, err := GetAndValidOpenAIImageRequest(c, relayconstant.RelayModeImagesEdits)
		require.NoError(t, err)
		require.NotNil(t, req.Stream)
		require.True(t, *req.Stream)
		require.True(t, req.IsStream(c))

		bodyAfterValidation, err := io.ReadAll(c.Request.Body)
		require.NoError(t, err)
		require.Equal(t, originalBody, string(bodyAfterValidation))

		form, err := common.ParseMultipartFormReusable(c)
		require.NoError(t, err)
		require.Equal(t, "true", url.Values(form.Value).Get("stream"))
		require.Len(t, form.File["image"], 1)
	})

	t.Run("invalid stream value is rejected", func(t *testing.T) {
		c, _ := newContext(t, "notabool", false)

		_, err := GetAndValidOpenAIImageRequest(c, relayconstant.RelayModeImagesEdits)
		require.Error(t, err)
		require.Contains(t, err.Error(), "invalid stream value")
	})
}

func TestGetAndValidateRequestConvertsChatImageModel(t *testing.T) {
	gin.SetMode(gin.TestMode)

	body := `{
		"model":"gpt-image-2",
		"messages":[
			{"role":"system","content":"You are helpful."},
			{"role":"user","content":"生成动漫武术战斗插画"}
		],
		"size":"1024x1024",
		"stream":true
	}`
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodPost, "/v1/chat/completions", strings.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	request, err := GetAndValidateRequest(c, types.RelayFormatOpenAI)
	require.NoError(t, err)
	require.True(t, IsChatCompletionImageCompatibility(c))

	imageRequest, ok := request.(*dto.ImageRequest)
	require.True(t, ok)
	require.Equal(t, "gpt-image-2", imageRequest.Model)
	require.Equal(t, "生成动漫武术战斗插画", imageRequest.Prompt)
	require.Equal(t, "1024x1024", imageRequest.Size)
	require.Equal(t, "high", imageRequest.Quality)
	require.NotNil(t, imageRequest.Stream)
	require.True(t, *imageRequest.Stream)
	require.NotNil(t, imageRequest.N)
	require.Equal(t, uint(1), *imageRequest.N)
}

func TestGetAndValidateRequestLeavesTextModelAsChat(t *testing.T) {
	gin.SetMode(gin.TestMode)

	body := `{
		"model":"gpt-4o-mini",
		"messages":[{"role":"user","content":"hello"}]
	}`
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Request = httptest.NewRequest(http.MethodPost, "/v1/chat/completions", strings.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")

	request, err := GetAndValidateRequest(c, types.RelayFormatOpenAI)
	require.NoError(t, err)
	require.False(t, IsChatCompletionImageCompatibility(c))

	textRequest, ok := request.(*dto.GeneralOpenAIRequest)
	require.True(t, ok)
	require.Equal(t, "gpt-4o-mini", textRequest.Model)
	require.Len(t, textRequest.Messages, 1)
}
