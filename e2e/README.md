# idreesia-web E2E tests

Playwright end-to-end coverage for `idreesia-web`. Lives at the repo root
(not inside `idreesia-web/`) so it stays outside the Meteor app's build
entirely and isn't tied to Meteor's own npm dependency tree.

## Prerequisites

1. The app must already be running and reachable (default `http://localhost:3000`):

   ```sh
   yarn docker:up
   ```

   or a local `meteor run` against a Mongo instance.
2. Copy `e2e/.env.example` to `e2e/.env` (gitignored) and fill in the
   credentials to log in with. The defaults match the fresh-dev-db seed
   from `idreesia-web/imports/startup/server/migrations/1-create-admin-user.ts`
   (`erp-admin` / `p@ssw0rd`) - override `E2E_ADMIN_USERNAME` /
   `E2E_ADMIN_PASSWORD` (and `PLAYWRIGHT_BASE_URL`) there for any
   environment where that password has changed, or to point at a
   different host entirely.
3. Install browsers once: `npx playwright install chromium`.

## Running

```sh
yarn test:e2e                 # headless run, chromium
yarn test:e2e:ui              # Playwright's interactive UI mode
yarn test:e2e --grep "@smoke" # filter by title/tag
PLAYWRIGHT_BASE_URL=https://staging.example.com yarn test:e2e
```

Three Playwright projects run in sequence via `dependencies` (see
`playwright.config.ts`): `auth` (`auth.spec.ts`, fresh logins per test) runs
first, then `setup` (`auth.setup.ts`) logs in once and saves that session
(Meteor's localStorage login token, captured as Playwright `storageState`),
then `chromium` reuses it for every other spec. `auth` has to go *before*
`setup` rather than in parallel with the rest: its "logs out" test calls the
app's real `Meteor.logoutOtherClients()`, which invalidates every other
login token for the account - fatal to any test running concurrently on the
shared session if the ordering were reversed.

## Layout

```text
e2e/
  playwright.config.ts   baseURL, storageState, project dependency chain
  support/
    constants.ts           route paths + seeded credentials
    ant-form.ts             AntD form helpers (fillTextField, selectOption, pickColor, ...)
    list-page.ts            list-chrome helpers (breadcrumbs, table rows, delete/edit icons)
  tests/
    auth.spec.ts            login / logout / validation (own `auth` project)
    auth.setup.ts           one-time admin login for every other spec (own `setup` project)
    navigation.spec.ts       data-driven smoke pass over every module list page
    admin/                   people-tags (modal-create CRUD), cities (full-page CRUD), users (smoke + filters)
    security/                visitor-registration (smoke + filters)
    hr/                      karkuns (smoke)
    stores/                  physical store -> stock items navigation (skips if none exist)
```

## Conventions

- **Selectors**: prefer role/text/placeholder queries (`getByRole`,
  `getByPlaceholder`) for anything with visible, stable copy. Fall back to
  the app's own CSS conventions from `docs/ui-design-guidelines.md`
  (`.list-container`, `.list-table`, `.ant-breadcrumb`, `[aria-label="delete"]`
  / `[aria-label="edit"]` row-action icons) rather than inventing new
  `data-testid` hooks the app doesn't already have.
- **AntD forms**: `support/ant-form.ts` locates a field by its
  `.ant-form-item:has(label[title="..."])` - AntD sets that `title`
  attribute to the exact label text regardless of layout, so it's a stable
  hook without depending on generated ids or DOM order.
- **Fixtures**: specs that create data clean it up in the same test
  (`admin/people-tags.spec.ts`, `admin/cities.spec.ts`). Where the app has
  no delete action at all (physical stores) or creating throwaway records
  is risky (karkuns carry payroll/attendance history), the spec stays
  read-only instead of leaving orphaned data behind.
- **New module coverage**: add its list page to `navigation.spec.ts` first
  (cheap breadcrumb+load check), then decide whether it warrants a deeper
  CRUD spec next to it, following the modal-create vs full-page-create
  split documented in `docs/ui-design-guidelines.md`.
