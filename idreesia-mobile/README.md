# Idreesia Mobile

Meteor (Cordova) mobile client for Idreesia ERP, built with
[antd-mobile](https://mobile.ant.design/).

The app has no database of its own. It talks to the **idreesia-web** backend:

- **Accounts** go over a dedicated DDP connection with its own
  `AccountsClient` ([imports/startup/backend.ts](imports/startup/backend.ts)).
  The login token is stored in localStorage, keyed by the backend URL, and the
  session resumes on startup.
- **Data** goes over the backend's `/graphql` endpoint with Apollo
  ([imports/startup/apollo-client.ts](imports/startup/apollo-client.ts)). The
  login token is sent in the `Authorization` header.

The backend URL comes from `public.backendUrl` in the Meteor settings. It falls
back to the `--mobile-server` value in device builds. Without either, the app
shows a configuration error.

## Authentication

| Screen          | Route              | Backend call                                    |
| --------------- | ------------------ | ----------------------------------------------- |
| Sign in         | `/login`           | DDP `login`, then GraphQL `updateLoginTime`     |
| Register        | `/register`        | GraphQL `registerUser` (sends enrollment email) |
| Forgot password | `/forgot-password` | DDP `forgotPassword` (sends reset email)        |
| Change password | `/change-password` | DDP `changePassword`                            |
| Sign out        | Account tab        | DDP `logout`, clears the Apollo cache           |

Sign in accepts either an email address or a username, like the web app. The
links in enrollment and reset emails open the **web app**. Users set their
password there, then sign in here.

Changing the password signs out every other session. Signing out on the web
app also signs out this app, because the web calls `logoutOtherClients()`.

## App structure

Features live inside the same functional modules as the web app (e.g.
Security → Visitors), registered in
[imports/ui/modules](imports/ui/modules). The Modules tab lists the modules the
signed-in user has permissions for. Screens are built from the shared `Page`
shell and status states in [imports/ui/layout](imports/ui/layout).

Read [docs/mobile-ui-design-guidelines.md](../docs/mobile-ui-design-guidelines.md)
before adding screens. It covers how to add a module or feature, navigation,
page templates, feedback, and the CSS rules.

## Theme

Colours, radii and fonts are defined once in
[imports/ui/theme/theme.ts](imports/ui/theme/theme.ts). The primary colour is
the green of the Idreesia flag (`#16803e`). At startup, `applyTheme()` publishes
the theme as CSS variables:

- `--app-color-*` (e.g. `--app-color-primary`, `--app-color-text-secondary`),
  `--app-radius-*`, `--app-elevation` and `--app-font-family` for the app's own
  CSS.
- The matching `--adm-*` variables, so antd-mobile components (buttons, forms,
  dialogs, toasts, lists) follow the theme automatically.

Rules for new pages:

- Never hard-code a colour. In CSS use `var(--app-color-…)`; in code import
  `palette` from `/imports/ui/theme`. Prefer antd-mobile's `color="primary"`
  and similar props over custom styling.
- For a new colour, add it to `palette` in `theme.ts`. It becomes available as
  `--app-color-<kebab-name>` automatically. If antd-mobile should use it too,
  map it in `antdMobileVariables` there.
- `mobile-config.js` can't import app code, so its `BackgroundColor` is kept in
  sync with `palette.background` by hand.

## Development

Start the web backend first (on port 3000):

```bash
cd ../idreesia-web
yarn start
```

Then start the mobile app. It serves the browser build on port 3100, so use
the browser's device emulation:

```bash
cd ../idreesia-mobile
yarn start
```

The sample settings point to `http://localhost:3000`.

GraphQL operations in `imports/ui/gql` are typed from
`idreesia-common/types/client-operations.ts`. After adding or changing one,
run `yarn codegen` from the repository root. Operation names must be unique
across the web and mobile apps, so mobile operations are prefixed with
`mobile`.

## Device Builds

```bash
yarn start:android
yarn start:ios
```

Before targeting a physical device or a non-local backend, point
`settings.sample.json` and the scripts' `--mobile-server` value at a URL the
device can reach. `localhost` on a phone is the phone itself.
