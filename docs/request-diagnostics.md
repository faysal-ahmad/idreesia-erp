# Request diagnostics: checking the client address

The ERP uses the client's IP address for the anonymous rate limits, the registration limit and the login throttle. On DigitalOcean App Platform, requests reach the app through Cloudflare and DO's ingress, so the TCP connection always comes from DO's internal ingress address. The real client address has to be read from the `X-Forwarded-For` header, and `HTTP_FORWARDED_COUNT` tells the ERP which entry to read.

`GET /api/diagnostics/request` echoes a request back exactly as the ERP received it, with the address the ERP derives from it. Use it to check `HTTP_FORWARDED_COUNT` after any hosting change, without deploying a separate echo app.

## How the client address is chosen

Every proxy appends the address it received the connection from to `X-Forwarded-For`. A client can send its own `X-Forwarded-For`, and proxies keep it and append to it, so entries on the left can be forged. Only the entries that your own proxies added can be trusted, and those are always on the right.

With `HTTP_FORWARDED_COUNT=N`, the ERP takes the **Nth entry from the right**:

- `client-address.ts` does this for the REST endpoints and their rate limits.
- Meteor does the same for a DDP connection's `clientAddress`. Both the web and mobile apps log in over DDP, so the login throttle uses this value.

If the variable isn't set, the socket address is used. On App Platform that is DO's ingress, so every client would share one rate limit.

## Current production setting

Checked on 2026-11-15 with a test request from `154.192.45.139` that also sent a forged `X-Forwarded-For: 5.6.7.8`:

```text
x-forwarded-for: 5.6.7.8,154.192.45.139,162.158.235.18
                 forged  client          Cloudflare edge
do-connecting-ip: 154.192.45.139
socket address:   100.127.19.81 (DO ingress)
```

So production uses **`HTTP_FORWARDED_COUNT=2`**, set on the ERP component under **App → Settings → (ERP component) → Environment Variables**.

App Platform also sets `do-connecting-ip` to the client address, and it replaces any value the client sends. The ERP doesn't use it, because Meteor only passes a fixed list of headers to DDP connections and `do-connecting-ip` isn't on it. The DDP login would never see it.

## Running the check

1. **Send a request with forged headers.** No login is needed:

   ```sh
   curl -s https://<erp-host>/api/diagnostics/request \
     -H 'X-Forwarded-For: 5.6.7.8' \
     -H 'do-connecting-ip: 1.2.3.4' | jq
   ```

2. **Find your real public IP** with `curl -s https://api.ipify.org`.

3. **Read the response:**

   ```json
   {
     "method": "GET",
     "path": "/api/diagnostics/request",
     "headers": { "x-forwarded-for": "5.6.7.8,154.192.45.139,162.158.235.18", "...": "..." },
     "socketAddress": "::ffff:100.127.19.81",
     "httpForwardedCount": "2",
     "clientAddress": "154.192.45.139"
   }
   ```

   | Result | Meaning |
   | --- | --- |
   | `clientAddress` is your real IP | The setting is correct. |
   | `clientAddress` is `5.6.7.8` | The count is too high. Clients can forge their address and get around the rate limits and the login throttle. Lower it now. |
   | `clientAddress` is a proxy address (Cloudflare `162.158.x.x`/`172.64.x.x`/…, or the socket address) | The count is too low, or not set. All clients share one limit. |

   To find the right value, count your real IP's position from the right in `headers["x-forwarded-for"]`.

Run the check again whenever the hosting changes, such as a new region, a custom domain behind another proxy or CDN, or a move off App Platform. Also run it if users from different places report being rate limited together.

## Endpoint reference

`GET /api/diagnostics/request`

- **Auth:** none. It only reflects the caller's own request, so anyone can call it with plain curl.
- **Rate limit:** the normal request limit: 60 a minute per client address when anonymous, or 300 a minute per user if a login token is sent.
- **Response:** `method`, `path`, `headers` (as received; `authorization` and `cookie` show as `"[redacted]"`), `socketAddress`, `httpForwardedCount` (the raw env value, or `null`) and `clientAddress` (the address the ERP uses for this request).
- **Code:** `idreesia-web/imports/startup/server/setup-diagnostics-endpoints.ts`.
