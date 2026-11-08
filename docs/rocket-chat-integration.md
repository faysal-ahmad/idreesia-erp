# Correspondence Inbox (Rocket.Chat Omnichannel)

The **Correspondence → Inbox** page shows customer messages that come in through Rocket.Chat Omnichannel (Livechat) and lets ERP representatives reply.

The ERP stores none of this data: there are no Mongo collections for it. The data stays in Rocket.Chat.

## How it fits together

```
mobile app ──(Livechat visitor API, token = mobile number)──▶ Rocket.Chat
                                                                  ▲
browser ──GraphQL (/graphql, @checkPermissions)──▶ ERP server ────┘ REST, service account
browser ──/api/correspondence/files/... (ERP auth)──▶ ERP server ─┘ /file-upload proxy
```

- **The browser never calls Rocket.Chat.** The Rocket.Chat URL and the service account token stay on the ERP server.
- **One entry per customer.** A Livechat visitor has at most one open room, so each open room is one customer.
- **Full history.** Opening a customer loads every room they've had, open or closed, merged oldest-first. Closed rooms' messages are cached in memory on the server.
- **Replies.** They're posted as the service account, with the rep's ERP display name as the message `alias`.
- **Media.** Files go through the ERP proxy, which checks the ERP login and permission.

| Piece | Location |
|---|---|
| Rocket.Chat REST client | `idreesia-common/server/chat/` |
| GraphQL module | `idreesia-common/server/graphql-api/correspondence/inbox/` |
| Media proxy route | `idreesia-web/imports/startup/server/setup-correspondence-endpoints.ts` |
| UI | `idreesia-web/imports/ui/modules/correspondence/inbox/` |

## Permissions

| Permission | Allows |
|---|---|
| `CORRESPONDENCE_INBOX_VIEW_MESSAGES` | Seeing the module, the conversation list, the history and media |
| `CORRESPONDENCE_INBOX_REPLY_TO_MESSAGES` | Sending replies; the reply box only shows for users who have it |

## One-time Rocket.Chat setup

The ERP talks to Rocket.Chat through one **service account**. It runs the inbox and creates chat accounts for ERP users (see [Chat accounts](#chat-accounts-for-erp-users)). These steps are done by hand once per environment: dev and production.

Settings that are the same everywhere are baked into the image (`containers/rocketchat/Dockerfile`), so there is nothing to configure for them. That includes Omnichannel, accepting chats with no agent online, manual routing, and the locked-down login and profile settings.

1. **Sign in as the admin.** The compose file seeds `admin` / `admin`. In production, use the `ADMIN_USERNAME` / `ADMIN_PASS` set on the Rocket.Chat app.
   - The password login form is controlled by `OVERWRITE_SETTING_Accounts_ShowFormLogin`. The image (`containers/rocketchat/Dockerfile`) defaults it to `false`. A value in the rocketchat service's `environment` in `docker-compose.yml` (in production, the App Platform env) overrides it.
   - It must be `"true"` for this setup. The compose file ships with that override; in production, add it to the App Platform env. After changing it, run `docker compose up -d rocketchat`.
   - Turn it off again once these steps are done (step 6).
2. **Create the service user.** Under **Administration → Users**, create `erp-service`:
   - email `erp-service@users.idreesia.local`, marked **verified**;
   - a password you'll only use for step 4;
   - roles **admin**, **livechat-agent** and **livechat-manager**.

   Why these roles:
   - **admin** covers creating chat accounts with these permissions:
     - **Create User**
     - **View Full Other User Info**, used to look up an existing account by user name
     - **Edit Other User Information**
     - **Edit Other User Active Status**
     - **Assign Roles**
     - **User Generate Access Token**

     Custom roles need an Enterprise licence on recent Rocket.Chat versions, so built-in roles are used. The account's token never leaves the ERP server.
   - **livechat-manager** provides **View All Omnichannel Rooms**, which the inbox's room list and room access need.
3. **Grant the remaining permissions to the `admin` role.** Rocket.Chat grants permissions to roles, not to individual users. `erp-service` gets these three through the **admin** role it was given in step 2.
   - Open **Administration → Workspace → Permissions**. The page is a table with one row per permission and one column per role.
   - For each permission below, type its name in the search box, then tick the checkbox in that row's **admin** column if it isn't already ticked. Leave the other roles' columns as they are.
   - Every user with the admin role gets these permissions too. That's the local `admin` account, which already has full access.

   The permissions:
   - **Impersonate Other Users**, so replies carry the rep's name as the alias.
   - **Bypass Rate Limit for REST API**. Rocket.Chat allows each account 10 calls per minute per endpoint, and every open inbox polls through this one account, so without it the inbox fails with `error-too-many-requests`.
   - **Create Personal Access Tokens**. This is a permission, not a setting.
4. **Create a token.**
   - Sign out and sign in **as `erp-service`**; tokens can only be created by their own account.
   - Open avatar → **My Account → Personal Access Tokens**. The tab only appears once step 3 is done; sign out and back in if it's missing.
   - Add a token named `erp` and tick **Ignore Two Factor Authentication**, so server-to-server calls never hit a 2FA prompt.
   - Copy the token and user ID right away. They're shown only once.
5. **Configure the ERP.**
   - **Dev:** put the values in `idreesia-web/.env`, then restart `idreesia-web`:
     ```
     ROCKETCHAT_URL=http://rocketchat:3000      # http://localhost:3100 when the ERP runs outside docker
     ROCKETCHAT_USER_ID=<user id shown with the token>
     ROCKETCHAT_AUTH_TOKEN=<token>
     ```
   - **Production:** set the same three as encrypted env vars on the ERP's App Platform component, with `ROCKETCHAT_URL` pointing at the Rocket.Chat component or URL.
6. **Clean up.**
   - Remove the `OVERWRITE_SETTING_Accounts_ShowFormLogin` override, or set it to `"false"`, so the image default applies again. Then run `docker compose up -d rocketchat` (in production, update the App Platform env). ERP users never sign in to Rocket.Chat with a password.
   - In production, also remove `ADMIN_PASS` from the Rocket.Chat app's env after its first boot.
   - The other production values (Atlas `MONGO_URL`, `ROOT_URL`, the Spaces `FileUpload_S3_*` settings, tightened CORS origins) are set on the Rocket.Chat app's env, using the compose file's `rocketchat` service as the template.
7. **File access needs no change.** Rocket.Chat only lets room members download Livechat files, and the service account never joins those rooms. So the ERP's media proxy fetches each file with that room's visitor credentials (`rc_room_type=l&rc_rid=…&rc_token=…`), looked up with the service account, and keeps Rocket.Chat's file-access settings at their defaults.

## Chat accounts for ERP users

Admins create a chat account for an ERP user from **Admin → Users**:

- **The list** has a **Chat Account** column. A check mark means the user has one.
- **The edit page** has a **Create Chat Account** button. It only shows when the user has no chat account yet.
  - It's only enabled once the user has a saved **user name** and **display name**. These become the chat user name and display name.
  - The user name field can be filled in once, for users that don't have one yet. After it's saved it's locked, because the chat account is keyed on it.
  - User names may only contain letters, digits, `.`, `-` and `_`, and must be unique ignoring case.
- **What gets created:**
  - The chat account gets the ERP email when there is one, otherwise `<username>@users.idreesia.local`.
  - Its password is random and never shown; users get into chat through the ERP.
  - It starts with only the `user` role.
  - If a chat account with that user name already exists, it's linked rather than duplicated.
- **What the ERP stores:** only the chat user's id, as `chatUserId` on the ERP user. Creating the account writes a "Chat Account Created" entry to **Admin → Security Logs**.

## Committee discussions

A committee can have **Discussions** turned on from **HR → Committees → (committee) → Features**. Members then get a **Discussions** item under that committee in the **Workspaces** sidebar, where they read and post messages and files.

**What happens in Rocket.Chat**
- **Turning Discussions on** creates a Rocket.Chat private group (`committee-<name>-<id suffix>`) and adds every member who has a chat account. The group's id is stored on the committee as `chatGroupId`.
- **Turning it off** archives the group.
- **Turning it back on** unarchives the same group, so its history stays. It also adds any members who are missing.
- **Membership changes made while it's on** are not yet synced to the group.

**Who can do what**
- **Reading** is open to committee members (and `erp-admin`), and only while Discussions is on. History and files are read as the service account, which owns the group, so members without a chat account can read too.
- **Posting and uploading** happen as the member's own chat account, so a member needs one (see [Chat accounts](#chat-accounts-for-erp-users)). Without one, the composer explains this instead of showing.

**Acting as a member (per-user tokens)**
- The ERP gets a login token for the member's chat account with `users.createToken`.
- It keeps the token on the ERP user as `chatAuthToken`. This is server-only and never returned through GraphQL.
- It reuses the stored token, and gets a new one only when Rocket.Chat rejects it.
- This needs:
  - `CREATE_TOKENS_FOR_USERS=true` on Rocket.Chat. It's baked into the image.
  - `CREATE_TOKENS_FOR_USERS_SECRET` on Rocket.Chat. It's set per environment: `docker-compose.yml` for dev, the Rocket.Chat App Platform env (encrypted) for production. Rocket.Chat 7+ refuses `users.createToken` without it.
  - `ROCKETCHAT_CREATE_TOKENS_SECRET` on the ERP, with the same value: `idreesia-web/.env` for dev, the ERP App Platform env for production.
  - The service account's **User Generate Access Token** permission. It already has this through the admin role (setup step 2).

**Files**
- Downloads go through `GET /api/workspaces/committees/:committeeId/discussions/files/:fileId/:fileName?sig=…`, and uploads through `POST /api/workspaces/committees/:committeeId/discussions/files` (field `file`, up to 25 MB).
- Both use the Meteor login token in the `Authorization` header and check committee membership.
- The service account can read every group's files. So each file URL in a message list carries a signature over (group, file), and the download route only serves a file whose signature matches that committee's group.

**Code layout**
- The GraphQL resolvers and REST routes only check access. The work is done in shared business logic, so other hosts (e.g. teams) can reuse it after their own checks.

| Piece | Location |
|---|---|
| Rocket.Chat group calls | `idreesia-common/server/chat/groups.ts` |
| Per-user tokens | `idreesia-common/server/business-logic/common/chat-user-credentials.ts` |
| Discussions logic (generic) | `idreesia-common/server/business-logic/discussions/` |
| Committee feature on/off | `idreesia-common/server/business-logic/hr/committee/` |
| Workspaces GraphQL (access checks) | `idreesia-common/server/graphql-api/workspaces/discussions/` |
| File routes | `idreesia-web/imports/startup/server/setup-workspace-discussion-endpoints.ts` |
| Reusable UI + `DiscussionDataProvider` | `idreesia-web/imports/ui/modules/common/discussions/` |
| Committee provider + page | `idreesia-web/imports/ui/modules/workspaces/discussions/` |
| Mobile screen (Home → workspace → Discussions) | `idreesia-mobile/imports/ui/workspaces/discussions/` |

**Mobile app**
- Members open a committee's discussion from **Home → (workspace) → Discussions**. It uses the same GraphQL queries and file routes as the web, with the mobile app's login token.
- The file routes allow CORS (like `/graphql`), because the app calls them from its own origin.
- It has what the web has:
  - the main list (polling every 5 s, "Load earlier messages" for history);
  - posting text, photos, files and voice notes through the shared composer (`imports/ui/components/message-composer`), with @mention suggestions;
  - threads (tap "N replies", or long-press → Reply in thread);
  - long-press actions: react, copy, star, pin (coordinators), and edit/delete own messages; tapping a reaction toggles your own;
  - search, pinned and starred messages from the ⋯ menu; picking one jumps to it in the list, or opens its thread.
- File attachments other than photos, audio and video open in a full-screen in-app preview (there's no in-app browser plugin), so formats the WebView can't show (e.g. Word) don't open yet.

## Trying it with curl (simulating the mobile app)

```sh
RC=http://localhost:3100
TOKEN=03001234567
curl -s -X POST $RC/api/v1/livechat/visitor -H 'Content-Type: application/json' \
  -d "{\"visitor\":{\"token\":\"$TOKEN\",\"name\":\"Test Customer\",\"phone\":\"$TOKEN\"}}"
RID=$(curl -s "$RC/api/v1/livechat/room?token=$TOKEN" | jq -r .room._id)
curl -s -X POST $RC/api/v1/livechat/message -H 'Content-Type: application/json' \
  -d "{\"token\":\"$TOKEN\",\"rid\":\"$RID\",\"msg\":\"Hello from the app\"}"
curl -s -X POST $RC/api/v1/livechat/upload/$RID -H "x-visitor-token: $TOKEN" -F file=@voice-note.mp3
```

## Known caveats

- **The visitor token is a credential.** Anyone who knows a customer's mobile number could read and send as that customer through the Livechat visitor API. The mobile app should consider a random secret token stored against the number.
- **Queued rooms stay queued.** `chat.sendMessage` only needs room access, so reps can reply to queued (unassigned) rooms, but Rocket.Chat still shows those rooms as queued. If this causes problems, join or take the room before replying.
- **The list loads at most 100 conversations** (20 per "Load more"). Search matches the customer name.

## Mobile app: public chat (customer side)

Customers chat from the mobile app's **Messages** page (`idreesia-mobile/imports/ui/chat`), opened from the sign-in screen without logging in.

- **It calls Rocket.Chat's Livechat visitor API directly** (`/api/v1/livechat/*`), not the ERP. These endpoints need no login; the visitor token is the credential.
  - So Rocket.Chat must be reachable from phones: a public HTTPS URL in production. The app reads it from `public.rocketChatUrl` (the device script sets the Mac's LAN address).
  - The REST API needs CORS. `docker-compose.yml` sets `API_Enable_CORS` and `API_CORS_Origin: "*"`; tighten the origin list for production. Preflight already allows `x-visitor-token`, which uploads need.
- **Identity.** The token is random, created once per install (`crypto.randomUUID()`), so typing someone else's number doesn't open their chat. The customer's name and mobile number (normalised to E.164, e.g. `+923001234567`) are sent as the visitor's name and phone.
  - The inbox shows that phone, looked up with `livechat/visitors.info` because room records don't carry it. It falls back to the token for older visitors whose token was their number.
  - History stays with the install: a new phone or a reinstall starts a fresh thread, though reps still see the same number. The number isn't verified.
- **Content.** Customers can send:
  - text;
  - camera photos;
  - attachments from the gallery or files (the paperclip button, up to 25 MB each, several at once);
  - voice notes, recorded WhatsApp-style (hold the mic to record, release to send, slide left to cancel). They use `MediaRecorder`: `audio/mp4` on iOS, `audio/webm` on Android and Chrome.

  Reps reply with text from the inbox, and replies show in the app.
- **Media.** Photos and voice notes load in the app through `/file-upload/...?rc_room_type=l&rc_rid=<room>&rc_token=<token>`. Rocket.Chat checks that the visitor belongs to the room.
- **Rate limits.** Rocket.Chat limits each IP to about 10 calls a minute per endpoint (5 for visitor and room). The app polls every 10 s, backs off to 30 s after a 429, and only asks for a room when it doesn't already know the open one.
- **History.** The visitor API can't list past conversations, so the app remembers the rooms it has seen and shows them all, with a "Conversation closed" divider when a rep closes one.
- **Not yet:** push notifications for replies while the app is closed. They're planned separately, and need a paid Apple Developer account and Firebase.

