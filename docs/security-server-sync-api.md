# Security Server sync API

Channels (camera feeds) and profiles (people on the watch list, with their photos) can be created and edited **both in the ERP** (under **Security → Security Server**) **and on the security server**. The security server keeps the two in step:

1. It **pulls** everything that changed in the ERP since its last sync and applies it, except for records it has changed itself since then. Its own changes win a conflict.
2. It **pushes** everything that changed on its side since its last sync.

Alerts are raised by the security server and pushed to the ERP. Reviews (Correct / False Positive) are recorded in the ERP only.

**Ids.** Each app keeps its own ids. Each record also stores the other app's id as `externalId`. In the ERP, `externalId` is the security server's id, and it stays unset until the security server has received the record. A push always identifies a record by the security server's own id, so repeating it is safe.

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

## Pulling changes

### `GET /api/security-server/changes?since=<ISO date>`

Returns channels and profiles created, updated or deleted at or after `since`. Leave out `since` on the first sync to get every active record.

```json
{
  "serverTime": "2026-10-25T14:09:21.000Z",
  "channels": [
    {
      "id": "f8ZJYqLWxSn9pyGPr",
      "externalId": null,
      "deleted": false,
      "name": "Main Gate",
      "enabled": true,
      "similarityThreshold": 0.42,
      "recognitionFps": 5,
      "minFaceSizePx": null,
      "minFaceQuality": 40,
      "connection": {
        "host": "192.168.1.20",
        "port": 554,
        "path": "/stream1",
        "username": "admin",
        "password": "…"
      }
    },
    { "id": "Xq7…", "externalId": "cm1…", "deleted": true }
  ],
  "profiles": [
    {
      "id": "ke8diPFN5nGWL8GdJ",
      "externalId": "cm2…",
      "deleted": false,
      "name": "John Doe",
      "isTest": false,
      "images": [{ "id": "WJqcCRFwyaTCbqbHS", "externalId": null }],
      "defaultImageId": "WJqcCRFwyaTCbqbHS"
    }
  ]
}
```

| Field | Notes |
|---|---|
| `serverTime` | Pass it as the next `since`. It's the ERP's own clock, so the two machines' clocks never need to agree. |
| `id` | The ERP id. Store it as the local record's `externalId`. |
| `externalId` | The security server's id, or `null` if the security server hasn't received the record yet. |
| `deleted` | The record was deleted in the ERP; only `id` and `externalId` are sent. |
| `similarityThreshold`, `minFaceSizePx`, `minFaceQuality`, `connection.*` | May be `null`. A `null` threshold or minimum means the server's default. |
| `minFaceSizePx`, `minFaceQuality` | Detected faces smaller than this (shorter side, camera pixels) or scoring below this quality (0–100) are skipped before matching. `0` turns the check off. |
| `images` | The profile's full photo set. Match each photo by `externalId` (your id) or `id`, download the ones you don't have, and remove local ones missing from the set. |
| `defaultImageId` | The ERP id of the profile's default photo, one of `images`. `null` means none was chosen; both sides then use the oldest photo. Map it to your own photo after applying `images`; if that photo couldn't be downloaded, keep your current default. It only picks the photo shown for the profile and plays no part in matching. |

**The response contains channel passwords.** Never log it.

Records the security server pushed during its last sync come back once in the next pull. Applying them changes nothing.

### `GET /api/security-server/profiles/:profileId/images/:imageId`

Returns one photo as `image/jpeg`, or `404` if the profile or photo no longer exists. A photo never changes under the same id. Photos are not checked again on arrival: the ERP checked them when they were uploaded here.

## Pushing changes

Each changed record is sent on its own, addressed by the **security server's id**. The body carries `erpId`, the ERP id the security server holds for the record (its `externalId`), or `null` if it has none. The ERP finds the record by the security server's id, then by `erpId`, and otherwise creates it. Each time it stores the security server's id as the record's `externalId`. Values that are unchanged are left alone.

A record deleted in the ERP comes back if the security server pushes an edit to it.

### `PUT /api/security-server/channels/by-external-id/:localId`

```json
{
  "erpId": "f8ZJYqLWxSn9pyGPr",
  "deleted": false,
  "name": "Main Gate",
  "enabled": true,
  "similarityThreshold": 0.42,
  "recognitionFps": 5,
  "minFaceSizePx": null,
  "minFaceQuality": 40,
  "connection": { "host": "192.168.1.20", "port": 554, "path": "/stream1", "username": "admin", "password": "…" }
}
```

A delete sends only `{ "erpId": …, "deleted": true }`. An empty `password` keeps the stored one. Returns `200 { "_id" }`, the ERP id to store as `externalId`; `_id` is `null` for a delete of a record the ERP never had.

### `PUT /api/security-server/profiles/by-external-id/:localId`

```json
{
  "erpId": null,
  "deleted": false,
  "name": "John Doe",
  "isTest": false,
  "defaultImageId": "cm9…",
  "images": [
    { "localId": "cm9…", "erpId": "WJqcCRFwyaTCbqbHS" },
    { "localId": "cm8…", "erpId": null, "mimeType": "image/jpeg", "data": "<base64>" }
  ]
}
```

- `images` is the profile's **full** photo set on the security server. The ERP removes photos missing from it.
- `defaultImageId` is the `localId` of the profile's default photo, or `null` if none was chosen. If it names a photo the ERP ends up listing in `missingImages`, the ERP keeps its current default until that photo arrives. Leaving the field out also keeps the ERP's current default.
- Send `mimeType` and `data` for photos the ERP doesn't have yet, which are those with no `erpId`. They're stored as they are, with no quality check, because the security server checked them when they were uploaded there.
- The body may be up to 50 MB.

Returns:

```json
{
  "_id": "ke8diPFN5nGWL8GdJ",
  "images": [{ "localId": "cm9…", "_id": "WJqcCRFwyaTCbqbHS" }],
  "missingImages": ["cm7…"]
}
```

Store `_id` and each photo's `_id` as their `externalId`. `missingImages` lists photos sent without `data` that the ERP no longer has. Send them again with `data`.

## Pushing alerts

### `PUT /api/security-server/alerts/:externalId`

`:externalId` is the security server's own alert id. The request is an idempotent upsert, so it is always safe to retry.

```json
{
  "profileId": "cm2…",
  "channelId": "cm1…",
  "timestamp": "2026-10-25T14:03:11.000Z",
  "similarityScore": 0.512,
  "faceSizePx": 142,
  "faceQuality": { "score": 71, "reasons": ["Face turned away"] },
  "image": { "mimeType": "image/jpeg", "data": "<base64>" }
}
```

| Field | Notes |
|---|---|
| `profileId`, `channelId` | The **security server's** ids. The ERP finds the records by `externalId`. |
| `similarityScore` | Cosine similarity, between 0 and 1. |
| `faceSizePx`, `faceQuality` | The matched face's shorter side in camera pixels, and its quality: a `score` from 0 to 100 and the `reasons` it scored low. Either may be `null` or missing for alerts raised before faces were checked. |
| `image` | The snapshot frame, as `image/jpeg`, `image/png` or `image/webp`. The security server sends a reduced copy (long side at most 1280px). Required the first time an alert is pushed; ignored after that. The body may be up to 10 MB. |

| Status | Meaning |
|---|---|
| `200 { "_id" }` | Stored. A repeat push of a known alert returns the same `_id` and changes nothing. |
| `422` | The profile or channel hasn't reached the ERP yet, or this is a new alert and `image` is missing. Retry after the next sync. |

An alert can still refer to a profile or channel that was just deleted in the ERP, if the server hasn't synced the deletion yet. It's accepted and kept as history.

### `POST /api/security-server/alerts/heartbeat`

Sent after every alert push run, including runs with nothing to send. The body is empty (`{}`). Returns `204`. The ERP records the time, by its own clock, and shows it on the alerts page as "Last synced", so a quiet camera isn't mistaken for a security server that's down or can't reach the ERP. The page warns once there's been no check-in for 5 minutes.

## Error handling summary

| Status | Retry? |
|---|---|
| `400` | No. The request itself is invalid. Fix it. |
| `401` | Log in again, then retry once. |
| `403` | No. Grant the permission. |
| `404` | A photo that no longer exists. It will be missing from the next pull. |
| `413` | No. The body is over the limit. |
| `422` | Sync, then retry the alert. |
| `5xx` / network error | Yes, with backoff. Every push is idempotent. |
