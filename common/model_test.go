package common

import (
	"testing"

	"github.com/QuantumNous/new-api/constant"
	"github.com/stretchr/testify/require"
)

func TestIsImageGenerationModelIncludesGPTImage2(t *testing.T) {
	require.True(t, IsImageGenerationModel("gpt-image-2"))
	require.True(t, IsImageGenerationModel("chatgpt-image-latest"))
	require.True(t, IsImageGenerationModel("imagen-4.0-generate"))
	require.False(t, IsImageGenerationModel("gpt-4o-mini"))
}

func TestImageGenerationModelEndpointIsPreferred(t *testing.T) {
	endpoints := GetEndpointTypesByChannelType(constant.ChannelTypeOpenAI, "gpt-image-2")

	require.NotEmpty(t, endpoints)
	require.Equal(t, constant.EndpointTypeImageGeneration, endpoints[0])
	require.Contains(t, endpoints, constant.EndpointTypeOpenAI)
}
