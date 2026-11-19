# Jitsi Integration (Video Calls)

The ERP uses a self-hosted [Jitsi Meet](https://jitsi.org/jitsi-meet/) server for video calls. Two features use it:

- **Discussions**: the "Video call" button in a committee discussion (see [rocket-chat-integration.md](rocket-chat-integration.md#video-calls-jitsi)).
- **Meetings**: meetings whose location is "Video call" (see [committee-headless-modules/meetings-design-and-usage.md](committee-headless-modules/meetings-design-and-usage.md)).

The ERP does not store anything about calls. Jitsi holds the call; the ERP only decides who gets the link and what room it points to.

## How it fits together

```
browser / mobile ──GraphQL──▶ ERP server        (checks access, builds the room link)
        │                          │
        │                          └─ GET JITSI_ROOM_CENSUS_URL ─▶ Jitsi (prosody)   "who is in the room?"
        │
        └─ opens JITSI_URL/<room>#settings ─▶ Jitsi web (signaling over HTTPS)
        └─ audio/video (UDP 10000) ─────────▶ Jitsi video bridge (JVB)
```

- **The ERP never joins or controls a call.** It builds a link; the user's browser (or the phone's in-app/system browser) talks to Jitsi directly. So `JITSI_URL` must be reachable from users' devices, not just from the ERP.
- **No Jitsi authentication.** Anyone holding a room link can join. Access control is the ERP's: only users allowed to join a discussion or meeting can get its link.
- **Room names are unguessable.** The room is `HMAC-SHA256(JITSI_ROOM_SECRET, roomKey)`, truncated to 32 hex characters. It is stable per discussion/meeting, can't be derived from the id, and doesn't reveal it. The key is the chat group id for a discussion, and `meeting:<meetingId>` for a meeting (the prefix keeps the two kinds from colliding). Changing `JITSI_ROOM_SECRET` changes every room name, so call links shared earlier stop pointing at the same room.
- **Join settings travel in the link's `#fragment`** so web and mobile behave the same: no "get the app" page on phones (`disableDeepLinking`), no Jitsi pre-join screen (`prejoinConfig.enabled=false`), and microphone muted on joining. The clients then append the user's own choices (microphone/camera switches from the ERP's own pre-join screen) and their display name. A later setting wins.
- **Pre-join screen in the ERP.** Before joining, web and mobile show how many people are already in the call (from `workspaceDiscussionVideoCallInfo` / `workspaceMeetingVideoCallInfo`) and Microphone / Camera switches. The call starts only when the user presses Join call.
- **Announcements (discussions only).** If the room is empty when someone joins, `workspaceJoinDiscussionVideoCall` posts "Started a video call" in the discussion. "Empty" comes from Jitsi's **room census**. If the census can't be read (not configured, timeout, error), the ERP treats the count as unknown and announces nothing. Meetings never announce.
- **Clients.**
  - Web: the call is an `<iframe>` inside the ERP (full window, or a small window in the top right corner), with `allow="camera; microphone; display-capture; ..."`.
  - Mobile, iOS: the in-app browser (`cordova-plugin-inappbrowser`, closed with "Done").
  - Mobile, Android: the system browser, because the plugin's Android WebView doesn't grant camera/microphone access to web pages.
  - Camera and microphone need **HTTPS** (or `localhost`), so production and phone testing both need an HTTPS `JITSI_URL`.

| Piece | Location |
|---|---|
| Env config (`JITSI_URL`, `JITSI_ROOM_SECRET`, `JITSI_ROOM_CENSUS_URL`) | `idreesia-common/server/video/config.ts` |
| Room name, link and census reader | `idreesia-common/server/video/room.ts` |
| Discussion join/announce logic | `idreesia-common/server/business-logic/discussions/video-call.ts` |
| Web call window | `idreesia-web/imports/ui/modules/common/video-call/` |
| Mobile opener | `idreesia-mobile/imports/ui/utilities/open-video-call.ts` |
| Dev Jitsi stack | `jitsi-*` and `cloudflared` services in `docker-compose.yml` |

## ERP environment variables

All three are in `idreesia-web/.env.example`. Without `JITSI_URL` and `JITSI_ROOM_SECRET`, joining a call fails with "Video calls are not configured".

| Variable | Required | Meaning |
|---|---|---|
| `JITSI_URL` | yes | Public base URL of Jitsi, as users' devices reach it. No trailing slash needed. |
| `JITSI_ROOM_SECRET` | yes | Secret the room names are derived from. Keep it private and stable. |
| `JITSI_ROOM_CENSUS_URL` | no | Jitsi's `/room-census` endpoint. Lets the ERP tell a starting call from a running one. |

## Local development

`docker compose up` starts the four Jitsi containers (`jitsi-prosody`, `jitsi-jicofo`, `jitsi-jvb`, `jitsi-web`). With the defaults in `idreesia-web/.env.example`:

- `JITSI_URL=http://localhost:8000`: fine for a browser on the same machine (browsers allow camera/mic on `localhost`).
- `JITSI_ROOM_CENSUS_URL=http://xmpp.meet.jitsi:5280/room-census`: the prosody container, reachable from `idreesia-web` inside the compose network.
- Set `JITSI_ADVERTISE_IPS` in a repo-root `.env` to your LAN address (macOS: `ipconfig getifaddr en0`), e.g. `192.168.1.20,127.0.0.1`. Firefox ignores loopback ICE candidates, so media won't connect with `127.0.0.1` alone.
- To test on a phone you need HTTPS: the `cloudflared` service is a Cloudflare quick tunnel. Read its address with `docker compose logs cloudflared | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1`, put it in `JITSI_URL`, and recreate `idreesia-web`. The address changes on every restart, and Jitsi is public while the tunnel runs, so `docker compose stop cloudflared` afterwards. Media still goes straight to the bridge, so the phone must be on the same Wi-Fi.

## Deploying Jitsi on a DigitalOcean Droplet

The ERP runs on App Platform, but Jitsi can't: the video bridge needs **UDP 10000** open to the internet, and App Platform has no UDP. So Jitsi runs on a Droplet, with the same four containers as the dev stack, plus Caddy in front. Caddy gets the HTTPS certificate for the subdomain automatically (a DNS record alone doesn't give HTTPS), and it also serves the room census behind a secret path, which `jitsi/web` doesn't expose. If the census were dropped, Caddy could be replaced by `jitsi/web`'s built-in Let's Encrypt (`ENABLE_LETSENCRYPT=1`), but then the ERP could not announce calls in discussions.

### 1. Create the Droplet and DNS

1. Create an Ubuntu 24.04 Droplet, in the same region as the ERP app. A call with ~10 people runs fine on 4 GB / 2 vCPU (Regular or Premium); size up with the number of concurrent calls, since the bridge is CPU- and bandwidth-bound.
2. Assign a **Reserved IP** (so the address survives rebuilding the Droplet) and create an `A` record, e.g. `meet.<your-domain>`, pointing to it. Caddy needs the record in place to get a certificate.
3. Add a **Cloud Firewall** on the Droplet allowing only:

   | Port | Protocol | From | Why |
   |---|---|---|---|
   | 22 | TCP | your IPs | SSH |
   | 80 | TCP | anywhere | Certificate issuance / HTTP redirect |
   | 443 | TCP | anywhere | Jitsi web and signaling (HTTPS/WebSocket) |
   | 10000 | UDP | anywhere | Call media (JVB) |

   Do **not** open 5280 (prosody HTTP): the room census has no authentication.
### 2. Initial server setup

Do this once on a new Droplet. Replace `meet.example.org` with your DNS name. It assumes the Droplet was created with your SSH key.

1. **Log in and update the system:**

   ```bash
   ssh root@meet.example.org
   apt update && apt upgrade -y
   ```

   Reboot if it upgraded the kernel (`reboot`), then log in again.

2. **Create a non-root admin user** and let it use your SSH key:

   ```bash
   adduser --disabled-password --gecos "" deploy
   usermod -aG sudo deploy
   echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
   rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
   ```

   From now on log in as `deploy@meet.example.org`. Optionally, then disable root and password logins in `/etc/ssh/sshd_config.d/` (`PermitRootLogin no`, `PasswordAuthentication no`) and run `sudo systemctl restart ssh`.

3. **Turn on automatic security updates:**

   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

4. **Install Docker** (this includes the Compose plugin, which must be 2.23 or newer for the inlined Caddyfile):

   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker deploy
   ```

   Log out and back in so the group applies, then check `docker compose version`.

5. **Add swap** on a 2 GB Droplet or smaller, so a load spike doesn't get the bridge killed (skip it on 4 GB or more):

   ```bash
   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
   sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

6. **Firewall:** the Cloud Firewall from step 1 is the only firewall needed. Don't enable `ufw` as well: Docker publishes container ports by editing `iptables` directly, which bypasses `ufw` rules, so `ufw` would give a false sense of security.

7. **Check DNS before starting Jitsi:** `dig +short meet.example.org` must print the Droplet's Reserved IP. Caddy can't get a certificate until it does (and repeated failures trigger Let's Encrypt rate limits).

8. **Note the address for `DROPLET_PUBLIC_IP`:** use the Reserved IP, the address users and browsers reach the bridge on. On a Droplet with a Reserved IP, the address shown in the control panel may differ from the Droplet's own IP, and the wrong one makes calls load with no audio or video.

### 3. Configure and start Jitsi

On the Droplet, clone the repo (use a read-only deploy key if it is private) and run Compose from the checkout:

```bash
git clone --depth 1 <repo-url> /opt/idreesia-erp
cd /opt/idreesia-erp
```

[docker-compose.jitsi.yml](../docker-compose.jitsi.yml) is the production counterpart of the dev stack in `docker-compose.yml`: the same four Jitsi containers (images pinned to the same release, `stable-11031`; bump them together when upgrading) plus Caddy, with its Caddyfile inlined. Differences from dev: no `BOSH_RELATIVE` / WebSocket overrides (with an HTTPS `PUBLIC_URL` the default WebSocket transports work), `JVB_ADVERTISE_IPS` is the Droplet's public IP, and TLS is handled by Caddy. The checkout also contains the dev `docker-compose.yml`, which must never be started on the Droplet: the `COMPOSE_FILE` line in `.env` below makes every plain `docker compose` command use the Jitsi file.

Create `/opt/idreesia-erp/.env` (generate every secret with `openssl rand -hex 24`; never commit this file). Compose refuses to start if any value is missing:

```bash
COMPOSE_FILE=docker-compose.jitsi.yml
JITSI_DOMAIN=meet.example.org            # your DNS name
DROPLET_PUBLIC_IP=203.0.113.10           # the Reserved IP
CENSUS_PATH_SECRET=<random>              # makes the census URL unguessable (see step 5)
JICOFO_AUTH_PASSWORD=<random>
JICOFO_COMPONENT_SECRET=<random>
JVB_AUTH_PASSWORD=<random>
JIBRI_RECORDER_PASSWORD=<random>
JIBRI_XMPP_PASSWORD=<random>
```

Start it with `docker compose up -d`, then check `docker compose logs -f caddy` for the certificate being issued and open `https://meet.example.org` in a browser: you should see the Jitsi start page, and a test room should connect with audio/video from two devices (try one on mobile data to prove the UDP path).

### 4. Link the ERP to it

Set these on the ERP app in App Platform (Settings → the `idreesia-web` component → Environment Variables), then redeploy:

| Variable | Value |
|---|---|
| `JITSI_URL` | `https://meet.example.org` |
| `JITSI_ROOM_SECRET` | a new random value (`openssl rand -hex 32`), different from dev |
| `JITSI_ROOM_CENSUS_URL` | `https://meet.example.org/<CENSUS_PATH_SECRET>/room-census` |

Mark `JITSI_ROOM_SECRET` and the census URL as **encrypted** (secret) variables. `JITSI_ROOM_SECRET` is only known to the ERP, not to the Droplet: Jitsi never needs it, because rooms are created on first join.

Then verify end to end:

1. `curl https://meet.example.org/<CENSUS_PATH_SECRET>/room-census` returns JSON like `{"room_census":[...]}`. The same path without the secret returns the Jitsi page or a 404, not the census.
2. In the ERP, open a discussion (or a video-call meeting), press Video call and Join call. The call should load inside the ERP with camera and microphone prompts, and a second device (web, and the mobile app on both iOS and Android) should be able to join the same room.
3. For a discussion, the first join posts "Started a video call"; a second join posts nothing. If nothing is ever announced, the ERP can't read the census: check `JITSI_ROOM_CENSUS_URL`.

### 5. Why the census sits behind a secret path

The census lists every active room name and participant count and has no authentication. The ERP must be able to read it, and it runs on App Platform, so there is no fixed address to allow through the Droplet firewall. A long random path segment checked by Caddy keeps it private without any change to the ERP, since the URL in `JITSI_ROOM_CENSUS_URL` is fetched as-is. Room names are already unguessable HMACs, so even a leaked census doesn't give anyone a way into a call it didn't already show, but treat the path like a password: rotate it by changing `CENSUS_PATH_SECRET` on the Droplet (`docker compose up -d caddy`) and `JITSI_ROOM_CENSUS_URL` on the ERP together. If App Platform dedicated egress IPs are ever used, a firewall rule for that IP is a stricter alternative (publish prosody's 5280 only to it).

### Operations

- **Upgrades:** bump all four `jitsi/*` image tags together (to a tag from the [docker-jitsi-meet releases](https://github.com/jitsi/docker-jitsi-meet/releases)), mirror the change in `docker-compose.yml`, `git pull && docker compose pull && docker compose up -d`, and retest a call. Active calls drop during the restart, so do it off-hours.
- **Logs:** `docker compose logs -f jvb` (media problems), `jicofo` (conference creation), `prosody` (signaling and census).
- **Media not connecting** (call loads, but no audio/video): almost always UDP 10000 blocked or `JVB_ADVERTISE_IPS` not the Droplet's public IP. Check the Cloud Firewall and the `.env`.
- **"Video calls are not configured" in the ERP:** `JITSI_URL` or `JITSI_ROOM_SECRET` is missing on the App Platform app.
- **Camera/mic blocked on a phone:** `JITSI_URL` isn't HTTPS.
- **Capacity:** one JVB handles a modest number of concurrent calls. If load grows, move to a larger Droplet before considering multiple bridges.
