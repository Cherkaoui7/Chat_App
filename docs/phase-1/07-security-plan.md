# 07 - Security Plan (MVP)

## Authentication

- Use Laravel Sanctum.
- Protected API routes behind `auth:sanctum`.
- Rotate/revoke token on logout.

## Authorization

- Conversation access policy: user must be participant.
- Message send policy: user must be participant.
- User profile update policy: owner only.

## Input Validation

- Enforce Form Request validation for every mutating endpoint.
- Reject unknown fields where practical.
- Enforce message length and allowed message types.

## Message Protection

- Store plain text only for MVP.
- Sanitize/escape message rendering on frontend.
- Strip risky HTML if rich text is introduced later.

## Rate Limiting

- Auth routes: strict limit (example `10/minute` per IP).
- Message send route: anti-spam limit (example `30/minute` per user).
- Search route: throttle to reduce abuse.

## File Upload Baseline (Avatar)

- Allow image MIME types only.
- Max file size limit.
- Randomized storage filename.
- Store outside public root and expose via controlled URL.

## Transport and Session

- HTTPS only in production.
- Secure and same-site cookie settings if session mode is used.
- CORS restricted to frontend origin.

## Logging and Monitoring

- Log auth failures, policy denials, and throttled requests.
- Do not log passwords, tokens, or sensitive raw payloads.
