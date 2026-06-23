# Review

## Summary

- Added compatibility for `/v1/chat/completions` requests that use image generation models such as `gpt-image-2`.
- Converts the last user text message into a `dto.ImageRequest` and routes it through the existing image generation relay path.
- Forces converted chat-image requests to marshal the converted image body, even when pass-through is enabled, so the upstream image endpoint does not receive chat JSON.
- Reused existing image request default validation logic for both native image requests and converted chat requests.

## Verification

- Local Go test could not run because local Go is `1.24.3`, while `go.mod` requires `1.25.1`.
- Server Docker verification passed:
  - `go test ./relay/helper ./relay/common ./common`

## Review Notes

- CCG-required Gemini/Claude wrapper is unavailable locally: `$USERPROFILE/.claude/bin/codeagent-wrapper` does not exist.
- ACE semantic search failed due to SSL certificate validation.
- Manual review found the change limited to OpenAI-compatible chat requests whose model is already classified by `common.IsImageGenerationModel`.
