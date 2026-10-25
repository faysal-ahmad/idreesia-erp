# Security Server push API

The ERP exposes REST endpoints that the security server (the face-recognition monitoring server, `idreesia-monitoring-server`) uses to push its channels, profiles and alerts. The ERP keeps a mirror of this data. ERP users browse it under **Security → Security Server**.

The data only flows one way, from the security server into the ERP. The ERP never calls back.

## Authentication

1. Create an ERP user for the security server, a service account, and grant it the **Security → Security Server → Push Security Server Data** permission (`security-push-security-server-data`). Don't give it any other permissions.
2. Log in with that account:

   ```http
   POST /login
   Content-Type: application/json

   { "username": "security-server", "password": "…" }
   ```

   The response is `{ "userId", "token", "tokenExpires" }`. Each login adds a new token to the account, so cache the token and only log in again when it is close to `tokenExpires` or after a `401`.
3. Send the token as the raw `Authorization` header value, with no `Bearer` prefix:

   ```http
   Authorization: <token>
   ```

| Status | Meaning |
|---|---|
| `401` | The token is missing, expired or unknown, or the account is locked. Log in again and retry once. |
| `403` | The account doesn't have `security-push-security-server-data`. |

## Conventions

- Every path is under `/api/security-server`.
- `:externalId` in a path is always the security server's own id (its Prisma `cuid`). The ERP stores it as `externalId` alongside its own `_id`. Every call is keyed on the server's ids, never on ERP ids.
- Request bodies are JSON (`Content-Type: application/json`), up to 15 MB.
- Dates are ISO 8601 strings, e.g. `"2026-10-25T14:03:11.000Z"`.
- Images are sent inline as `{ "mimeType": "image/jpeg", "data": "<base64>" }`. Supported types are `image/jpeg`, `image/png` and `image/webp`. The ERP stores images in object storage, not in its database.
- Errors come back as `{ "error": "<message>" }`.
- Every `PUT` is an idempotent upsert, so it is always safe to retry. A full resync is just pushing everything again.

### Ordering

An alert refers to a profile and a channel, so **push a channel and a profile before any alert that refers to them**. If you push an alert first, it is rejected with `422`. Push the missing record, then retry the alert.

For a full resync, push all channels, then all profiles, then all alerts.

## Channels

Channels mirror `VideoFeedSource`. The connection `config` (RTSP host and credentials) is **never** sent.

### `PUT /api/security-server/channels/:externalId`

```json
{
  "name": "Main Gate",
  "enabled": true,
  "similarityThreshold": 0.42,
  "recognitionFps": 5
}
```

| Field | Type | Notes |
|---|---|---|
| `name` | string | required |
| `enabled` | boolean | required |
| `similarityThreshold` | number \| null | `null` means the channel uses the server default |
| `recognitionFps` | number | required |

Response: `200 { "_id": "<erp id>" }`.

When a channel is renamed, the channel name stored on its existing alerts is updated too.

### `DELETE /api/security-server/channels/:externalId`

The channel is soft-deleted in the ERP and its alerts are kept. Pushing the channel again with `PUT` restores it.

Response: `204`. This is also returned if the channel is unknown or already deleted.

## Profiles

Profiles mirror `MonitoringProfile` and its images.

### `PUT /api/security-server/profiles/:externalId`

```json
{
  "name": "John Doe",
  "isTest": false,
  "createdAt": "2026-10-01T09:00:00.000Z",
  "updatedAt": "2026-10-20T11:30:00.000Z",
  "images": [
    { "id": "6f1c…", "mimeType": "image/jpeg", "data": "<base64>" },
    { "id": "a92e…" }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `name` | string | required |
| `isTest` | boolean | required. Test profiles are hidden from ERP lists unless the user asks for them. |
| `createdAt`, `updatedAt` | date \| null | optional; when the profile was created and last updated on the server |
| `images` | array | required. The **complete** current list of images, in display order. |
| `images[].id` | string | required. The `MonitoringProfileImage` id. |
| `images[].mimeType`, `images[].data` | | Required only for images the ERP doesn't have yet. For an image the ERP already holds, send just its `id`; any data sent with it is ignored and nothing is re-uploaded. |

How the ERP reconciles images:
- An id it hasn't seen before is uploaded. If that image has no `data`, the request fails with `422`.
- An id it already has is kept as is.
- An id that has disappeared from the list has its image deleted from the ERP.

Response: `200 { "_id": "<erp id>" }`.

When a profile's name or `isTest` changes, those values stored on its existing alerts are updated too.

**Simplest client strategy:** always send `data` for every image. This costs bandwidth but needs no state. To save bandwidth, send data only for images added since the last successful push. If you get a `422`, send all the data again.

### `DELETE /api/security-server/profiles/:externalId`

The profile is soft-deleted in the ERP and its images are removed. Its alerts, including their snapshots, are kept as history. Pushing the profile again with `PUT` restores it, but the images must be sent again with their data.

Response: `204`. This is also returned if the profile is unknown or already deleted.

## Alerts

Alerts mirror `Alert`. The ERP keeps its own alert history, so the server's local retention purge must **not** be pushed as deletes. There is no alert `DELETE` endpoint.

### `PUT /api/security-server/alerts/:externalId`

```json
{
  "profileId": "<profile externalId>",
  "channelId": "<channel externalId>",
  "timestamp": "2026-10-25T14:03:11.000Z",
  "similarityScore": 0.512,
  "review": null,
  "reviewedAt": null,
  "image": { "mimeType": "image/jpeg", "data": "<base64>" }
}
```

| Field | Type | Notes |
|---|---|---|
| `profileId` | string | required. The security server's profile id. |
| `channelId` | string | required. The security server's channel id. |
| `timestamp` | date | required |
| `similarityScore` | number | required. Cosine similarity, between 0 and 1. |
| `review` | `"CORRECT"` \| `"FALSE_POSITIVE"` \| null | optional |
| `reviewedAt` | date \| null | optional. Defaults to the time of the push when `review` is set. |
| `image` | `{ mimeType, data }` | Required the first time an alert is pushed. Ignored after that. |

Alerts never change on the server apart from their review. So when an alert the ERP already has is pushed again, only `review` and `reviewedAt` are applied. The snapshot is never replaced.

| Status | Meaning |
|---|---|
| `200 { "_id": "<erp id>" }` | Stored. |
| `422` | The profile or channel hasn't been pushed yet, or this is a new alert and `image` is missing. |

### `PATCH /api/security-server/alerts/:externalId/review`

A lightweight way to sync a review change made on the server.

```json
{ "review": "FALSE_POSITIVE", "reviewedAt": "2026-10-25T15:00:00.000Z" }
```

Send `"review": null` to clear a review.

| Status | Meaning |
|---|---|
| `204` | The review was updated. |
| `404` | The alert hasn't been pushed yet. Push it with `PUT` instead, which also carries the review. |

## Error handling summary

| Status | Retry? |
|---|---|
| `400` | No. The request itself is invalid. Fix it. |
| `401` | Log in again, then retry once. |
| `403` | No. Grant the permission. |
| `404` / `422` | Push the missing channel, profile or alert first, or include the missing image data. Then retry. |
| `413` | No. The body is over 15 MB. Send fewer or smaller images per request. |
| `5xx` / network error | Yes, with backoff. Every `PUT` is idempotent. |
