# Review

## Summary

- Added `gpt-image-2` and `chatgpt-image-latest` to `common.ImageGenerationModels`.
- Added tests for image model classification and endpoint priority.
- Deployed server image `new-api:custom-ui-20260618085612`.

## Verification

- Local `go test ./common` could not run because local Go is `1.24.3`, `go.mod` requires `1.25.1`, and automatic toolchain download from `proxy.golang.org` timed out.
- Server `docker run --rm -v "$PWD":/src -w /src golang:1.26.1-alpine go test ./common` passed.
- Server `/api/pricing` returned `gpt-image-2` with `supported_endpoint_types: ["image-generation", "openai"]`.
- Server container `new-api` is healthy on image `new-api:custom-ui-20260618085612`.

## External Review

- CCG-required Gemini/Claude wrapper was unavailable on this machine: `$USERPROFILE/.claude/bin/codeagent-wrapper` does not exist.
- Manual review found no broader routing changes and no database/API contract changes beyond endpoint classification metadata.

## Notes

- The issue was caused by `gpt-image-2` not being classified as an image-generation model, so the pricing/model API surfaced the OpenAI chat endpoint first.
- The fix intentionally does not make `/v1/chat/completions` accept image-generation request payloads; the generated API example should now point clients to `/v1/images/generations`.
