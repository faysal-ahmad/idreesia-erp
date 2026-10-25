# Security Server sync API

The ERP is the source of truth for the security server's configuration:

- **Channels** (camera feeds) and **profiles** (people on the watch list, with their enrollment photos) are created and edited in the ERP, under **Security → Security Server**. The security server **pulls** them.
- **Alerts** are raised by the security server and **pushed** to the ERP.
- **Alert reviews** (Correct / False Positive) are recorded in the ERP. The security server can pull them, for example to tune similarity thresholds.

## Authentication

1. Create an ERP user for the security server, a service account. Grant it only the **Security → Security Server → Sync Security Server Data** permission (`security-sync-security-server-data`).
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
| `403` | The account doesn't have `security-sync-security-server-data`. |

Every path is under `/api/security-server`. Request and response bodies are JSON. Dates are ISO 8601 strings. Errors come back as `{ "error": "<message>" }`.

## Pulling the configuration

### `GET /api/security-server/config`

Returns a **full snapshot** of every active channel and profile:

```json
{
  "generatedAt": "2026-10-25T14:09:21.000Z",
  "channels": [
    {
      "id": "f8ZJYqLWxSn9pyGPr",
      "name": "Main Gate",
      "enabled": true,
      "similarityThreshold": 0.42,
      "recognitionFps": 5,
      "connection": {
        "host": "192.168.1.20",
        "port": 554,
        "path": "/stream1",
        "username": "admin",
        "password": "…"
      },
      "updatedAt": "2026-10-25T14:09:20.000Z"
    }
  ],
  "profiles": [
    {
      "id": "ke8diPFN5nGWL8GdJ",
      "name": "John Doe",
      "isTest": false,
      "updatedAt": "2026-10-25T14:09:21.000Z",
      "images": [
        {
          "id": "WJqcCRFwyaTCbqbHS",
          "url": "https://…presigned…",
          "uploadedAt": "2026-10-25T14:09:21.000Z"
        }
      ]
    }
  ]
}
```

| Field | Notes |
|---|---|
| `id` | The ERP id. Use it as the record's id on the security server, and send it back when pushing alerts. |
| `similarityThreshold` | `null` means use the server's default. |
| `connection.port`, `path`, `username`, `password` | Each may be `null`. |
| `isTest` | Calibration profiles. Whether they raise live alerts is the server's choice. |
| `images[].url` | A presigned download link, valid for **1 hour**. Download new images straight away rather than storing the URL. |

**The snapshot contains passwords.** Never log it, and don't cache it anywhere but the security server's own store.

**Polling:**
- Every response carries an `ETag`. Send it back as `If-None-Match`.
- While nothing has changed, the answer is `304 Not Modified` with no body, so a poll every 30–60 seconds is cheap.
- Any edit in the ERP changes the ETag. That includes adding or removing an image and deleting a channel or profile.

**Reconciling the snapshot** (after a `200`):
- **Channels and profiles:** create or update every record in the snapshot. Delete any record you hold that is **not** in it, because it was deleted in the ERP.
- **Images:** match them by `images[].id`.
  - Download and embed an id you haven't seen before.
  - Drop one that has disappeared.
  - An image's content never changes under the same id. Replacing a photo means removing it and adding a new one.

**Image quality:** every image passed the ERP's face quality gate before it was stored. The image is normalised to an upright JPEG, at most 1280px on its long side, with exactly one face of at least 40px. That's the same YuNet/SFace check the security server applies, with the same model version (`yunet-2023mar+sface-2021dec+umeyama-fix`), including its downscaled retry for very large close-up faces. So there is no need to report rejected images back.

## Pushing alerts

### `PUT /api/security-server/alerts/:externalId`

`:externalId` is the security server's own alert id. The request is an idempotent upsert, so it is always safe to retry.

```json
{
  "profileId": "ke8diPFN5nGWL8GdJ",
  "channelId": "f8ZJYqLWxSn9pyGPr",
  "timestamp": "2026-10-25T14:03:11.000Z",
  "similarityScore": 0.512,
  "image": { "mimeType": "image/jpeg", "data": "<base64>" }
}
```

| Field | Notes |
|---|---|
| `profileId`, `channelId` | ERP ids, as received in the config snapshot. |
| `similarityScore` | Cosine similarity, between 0 and 1. |
| `image` | The snapshot frame, as `image/jpeg`, `image/png` or `image/webp`. Required the first time an alert is pushed; ignored after that. The body may be up to 10 MB. |

| Status | Meaning |
|---|---|
| `200 { "_id" }` | Stored. A repeat push of a known alert returns the same `_id` and changes nothing. |
| `422` | The profile or channel id is unknown, or this is a new alert and `image` is missing. Pull the config again and retry. |

An alert can still refer to a profile or channel that was just deleted in the ERP, if the server hasn't pulled the deletion yet. It's accepted and kept as history.

The ERP keeps its own alert history, so purging old alerts locally on the server needs no call.

## Pulling alert reviews

### `GET /api/security-server/alert-reviews?since=<ISO date>&limit=<n>`

Reviews made in the ERP, oldest change first:

```json
[
  {
    "alertId": "<your externalId>",
    "review": "CORRECT",
    "reviewedAt": "2026-10-25T14:09:31.000Z",
    "reviewUpdatedAt": "2026-10-25T14:09:31.000Z"
  }
]
```

- `review` is `"CORRECT"`, `"FALSE_POSITIVE"` or `null`. `null` means the review was cleared, and `reviewedAt` is then `null` too.
- Leave out `since` to start from the beginning.
- `limit` defaults to 500, with a maximum of 2000.
- **Paging:** pass the last record's `reviewUpdatedAt` as the next `since`. Keep paging until a page is shorter than `limit`.

## Error handling summary

| Status | Retry? |
|---|---|
| `304` | Nothing changed; keep the current config. |
| `400` | No. The request itself is invalid. Fix it. |
| `401` | Log in again, then retry once. |
| `403` | No. Grant the permission. |
| `422` | Pull the config, then retry the alert. |
| `413` | No. The body is over 10 MB. |
| `5xx` / network error | Yes, with backoff. Alert pushes are idempotent. |
