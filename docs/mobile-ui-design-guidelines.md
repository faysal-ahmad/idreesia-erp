# Mobile UI Design Guidelines

Conventions for building screens in `idreesia-mobile`, so every feature looks and behaves the same. This is the mobile counterpart of [ui-design-guidelines.md](ui-design-guidelines.md) (web).

antd-mobile only ships components and theming docs. It has no guidance on page patterns or layouts. These rules adapt Ant Design's [design specification](https://ant.design/docs/spec/introduce) (patterns for navigation, data entry, data display, feedback and page templates) to phone screens, using antd-mobile components.

---

## Reference implementation

| Area | Location |
|------|----------|
| Theme (colours, radii, font) | `idreesia-mobile/imports/ui/theme/theme.ts` |
| Page shell | `idreesia-mobile/imports/ui/layout/page.tsx` |
| Loading / empty / error / no-access states | `idreesia-mobile/imports/ui/layout/status.tsx` |
| Back navigation | `idreesia-mobile/imports/ui/layout/navigation.tsx` |
| Tab bar | `idreesia-mobile/imports/ui/layout/tab-bar.tsx` |
| Module / feature types | `idreesia-mobile/imports/ui/modules/types.ts` |
| Module registry | `idreesia-mobile/imports/ui/modules/registry.ts` |
| Permission rules | `idreesia-mobile/imports/ui/modules/access.ts` |
| Example module (Security → Visitors) | `idreesia-mobile/imports/ui/modules/security/` |
| List screen (search, filters, paging) | `idreesia-mobile/imports/ui/modules/security/visitors/visitors-list-screen.tsx` |
| List row | `idreesia-mobile/imports/ui/modules/security/visitors/visitor-list-item.tsx` |
| Filters bottom sheet | `idreesia-mobile/imports/ui/modules/security/visitors/visitor-filters-popup.tsx` |
| Camera capture (Cordova + browser) | `idreesia-mobile/imports/ui/utilities/capture-photo.ts` + `imports/ui/components/camera-view.tsx` |
| Photo search screen | `idreesia-mobile/imports/ui/modules/security/visitors/photo-search-screen.tsx` |
| Paged query → infinite list | `idreesia-mobile/imports/ui/hooks/use-paged-query.ts` + `imports/ui/components/paged-list.tsx` |
| Form screen | `idreesia-mobile/imports/ui/account/change-password-screen.tsx` |
| Shared CSS | `idreesia-mobile/client/main.css` |
| Page CSS example | `idreesia-mobile/imports/ui/account/account-screen.styles.css` |

---

## 1. App structure: modules and features

The mobile app uses the same functional modules as the web app (`ModuleNames` / `ModulePaths` in `idreesia-common/constants`). Each module contains **features**, which are use cases such as Security → Visitors.

```
Modules tab (/)
└── Security (/security)                 ← module screen, lists its features
    └── Visitors (/security/visitors)    ← feature; owns every route below it
        ├── /security/visitors/:id       ← detail
        └── /security/visitors/new       ← form
Account tab (/account)
└── Change password (/account/change-password)
```

- **Modules** are declared as `ModuleDefinition`s and registered in `modules/registry.ts`. Only add a module to the mobile app once it has at least one mobile feature.
- **Features** are `FeatureDefinition`s inside their module. Each one has a `path` under the module's path, a list of `permissions`, and a `component`. The component owns every route under its path, so it renders its own `<Switch>` for list, detail and form screens.
- **Visibility follows permissions.**
  - A feature is shown when the user has **any** of its permissions (`Permissions` from idreesia-common).
  - A module is shown when the user can use at least one of its features. On the web, a module only needs one permission with the module's prefix; on mobile, a module with nothing usable in it would be a dead end.
  - `FeatureGate` blocks deep links to features the user can't use.
  - Hiding things in the UI isn't security. The server still enforces permissions on every query and mutation.

### Adding a feature

1. Create `modules/<module>/<feature>/` containing the feature component and its screens.
2. Add its path to `modules/<module>/paths.ts`, always under `ModulePaths.<module>`.
3. Add a `FeatureDefinition` to the module's `features`. Give it a title, a one-line description, an `antd-mobile-icons` icon, its path, its permissions and its component.
4. The routes, the module screen entry and the permission gate come for free. Don't add routes to `app.tsx`.

### Adding a module

1. Create `modules/<module>/index.tsx` exporting a `ModuleDefinition` that uses the shared `ModuleNames` / `ModulePaths` values.
2. Add it to `modules` in `registry.ts`. The list order is the display order.

---

## 2. Navigation

- **Tab bar:** Modules and Account are the only top-level destinations. The tab bar shows only on their root screens. Don't add tabs per module; modules are listed on the Modules tab.
- **Drill-down:** every screen below a tab root is full-screen, with a back arrow in the nav bar. Keep the hierarchy to at most **module → feature → list → detail → form**. If you need more levels, rethink the flow, for example with a popup or tabs inside the detail screen.
- **Back:** set `backTo` on `Page` to the parent route. `useNavigateBack` uses `history.goBack()` when the user got there within the app, which keeps Android's hardware back button in step. On a deep link or after a reload, it replaces the current route with the parent, so the back arrow never leaves the app.
- **After saving:** go back to where the user came from with `useNavigateBack(parentPath)`, not `history.push`. That way back doesn't return to the form.
- **Routes:** use path constants (`<Module>Paths`, `AccountPaths`), never string literals. Routes use a `HashRouter` (`/#/…`), which Cordova needs.

---

## 3. Page shell

Every signed-in screen is wrapped in `Page`:

```tsx
<Page title="Visitors" backTo={ModulePaths.security} right={<AddOutline />}>
  …
</Page>
```

| Prop | Use |
|------|-----|
| `title` | Short noun, the screen's subject ("Visitors", "Change password"). The entity name on detail screens. |
| `backTo` | Parent route. Leave it out only on tab roots. |
| `right` | At most one or two icon actions (add, filter, more). Put anything else in an `ActionSheet`. |
| `footer` | A pinned primary action for non-form screens (e.g. "Check in"). Forms put their submit button in the antd-mobile `Form` `footer` instead. |

The shell handles the themed nav bar, sticky positioning and safe areas (notch and home indicator). Don't build your own nav bar or add `SafeArea` spacers.

Signed-out screens use `AuthLayout` (`components/auth-layout.tsx`) instead.

---

## 4. Page templates

### List screen

A feature's entry screen is usually a list. Build it from `usePagedQuery` and `PagedList`, as the Visitors list does. They handle pull-to-refresh, infinite scroll, the result count, de-duplication and the loading, empty and error states.

- **Content:** `List` (`mode="card"`), with one `List.Item` per record.
  - Main line: the record's name.
  - `description`: one or two secondary facts, such as CNIC, city or last visit.
  - `extra` (right side): a status `Tag` or a date.
  - `prefix` (left side): an avatar or icon.
- **Search:** a `SearchBar` in a `list-toolbar` at the top of the body. Debounce it by about 350 ms and search on the server.
  - Prefer one search box over several fields.
  - The Visitors list routes typed digits to the exact-match CNIC or phone filters, in their stored formats, and anything else to name search (`parse-search.ts`).
  - Explain partial input with a `list-toolbar-hint` instead of querying.
- **Filters:** put the filter controls in a bottom `Popup` (`filters-popup`, one tab per filter, Clear / Apply) opened from a filter icon in the nav bar's `right` slot. Put a `Badge` with the active-filter count on that icon. Show the active filters as closable `Tag`s in `list-filter-chips` under the search bar. Don't show inline filter forms.
- **Paging:** paged GraphQL queries take `pageIndex` / `pageSize` in their `filter` and return `{ totalResults, data }`. Their server-side sort needs a unique tie-breaker (e.g. `_id`), or pages overlap.
- **Photos:** `getBackendFileUrl(imageThumbnailId ?? imageId)` from `/imports/startup/backend`. The web's `getDownloadUrl` points at the app's own origin, not the backend.
- **Loading more:** use `PullToRefresh` around the list and `InfiniteScroll` below it. Don't use numbered pages.
- **Row actions:** tapping a row opens its detail screen. Put the one or two most common actions in `SwipeAction`; everything else goes on the detail screen.
- **Creating a record:** an add icon in the nav bar, or a pinned `footer` button if creating is the main job of the screen.
- **States:** show `PageLoading` on the first load, `PageEmpty` when there are no results (with a create action if the user can create), and `PageError` with `onRetry` on failure.

### Detail screen

- **Layout:** the title is the entity's name. Start with a summary card (photo, name, key identifiers), then `List mode="card"` groups with a `header`, one group per section (e.g. "Contact", "Visits").
- **Actions:** for up to two actions, use a pinned `footer` (primary button, plus an outline secondary button if needed). For more, use an `ActionSheet` from a "more" icon.
- **Destructive actions:** confirm with `Dialog.confirm`, and use the danger colour for the confirm button.
- **Related lists:** show the first few items inline, with a "View all" item that opens a full list screen.

### Form screen

- **Layout:** antd-mobile `Form` with `layout="vertical"` and `mode="card"`, one field per row. Never put fields side by side.
- **Submit:** a primary block `Button` in the form's `footer`, with `loading` while saving and a label that says what it does ("Register visitor", not "Submit").
- **Choices:** use `Picker`, `CascadePicker` or `DatePicker` (opened from a `Form.Item` with `onClick`) instead of free-text fields. For lists that are too long for a picker, open a searchable selection screen.
- **Grouping:** for long forms, split the fields into several `Form` cards with `Form.Header`s. For more than about 8 fields, consider steps (`Steps`) instead of one long scroll.
- **Validation:** use `rules` on each `Form.Item`, with a message that tells the user what to do ("Please enter the CNIC."). Validate formats on the client, and show server errors in a `Toast`.
- **Keyboard:** set `type`, `inputMode`, `autoComplete` and `autoCapitalize` so phones show the right keyboard.

### Camera screens

- Take photos with `capturePhoto()` (`imports/ui/utilities`). It is **camera-only**: users can't pick an existing image.
  - In the Cordova apps it uses cordova-plugin-camera with the camera as the only source.
  - In a browser it shows `CameraView`, a full-screen live viewfinder with a shutter button. It doesn't use a file input, which would also offer the gallery.
  - It returns a JPEG data URL of at most 1024 px, which keeps uploads well under the 5 MB GraphQL limit.
- Start capture from an explicit "Take photo" button rather than opening the camera on load.
- Show the captured photo above the results, and pin a "Retake photo" button in the `footer`.
- When the server says the photo is unusable, tell the user what to change ("Move closer and retake"), not only that it failed.
- If a new feature needs another native capability, add the plugin to `.meteor/cordova-plugins`. Add its iOS usage description in `mobile-config.js`.

### Result screen

After a flow completes and the user needs to know what happens next (for example "registered, check your email"), replace the form with a `Result` plus a primary button that returns to the list. For simple saves, a success `Toast` and going back is enough.

---

## 5. Feedback

| Situation | Use |
|-----------|-----|
| Action succeeded (saved, deleted) | `Toast` with `icon: 'success'`, then go back |
| Action failed | `Toast` with `icon: 'fail'` and `getErrorMessage(error, fallback)` |
| Irreversible or destructive action | `Dialog.confirm` before doing it |
| Flow finished and the user needs next steps | `Result` screen |
| Screen loading / empty / failed / not allowed | `PageLoading` / `PageEmpty` / `PageError` / `NoAccess` |
| Backend connection lost | Handled globally by `NoticeBar` in `app.tsx`; don't duplicate it |
| Button action in progress | `loading` on the button; disable double submits |

- Never render `null` while loading, and never leave a blank screen.
- Keep error text human-readable. `getErrorMessage` prefers the server's `reason`.

---

## 6. Theme and CSS

- **Colours, radii and fonts** come only from `imports/ui/theme/theme.ts`.
  - In CSS use `var(--app-color-…)`, `var(--app-radius-…)` and `var(--app-elevation)`.
  - In code import `palette` from `/imports/ui/theme`.
  - Never hard-code a colour.
- **Components before custom styling.** Prefer antd-mobile props such as `color="primary"` and `fill="outline"`. antd-mobile components are already themed through the `--adm-*` variables.
- **Shared chrome** (shell, status states, auth, list icons) lives in `client/main.css`.
- **Page-only rules** go in `*.styles.css` next to the screen, **imported only from `client/main.tsx`**. This is the same Meteor rule as the web: don't import CSS from `.tsx` files, and don't give a CSS file the same basename as a `.tsx` file.
- **Icons:** use `antd-mobile-icons` only, in outline style. Leading list icons use the `list-icon` class.
- **Touch targets** are at least 44 px high. Screens are portrait-only.
- **Locale:** antd-mobile's built-in text defaults to Chinese. `client/main.tsx` sets English globally with `setDefaultConfig({ locale: enUS })`, which also covers `Dialog` and `Toast`.

---

## 7. Copywriting

- Use sentence case for titles, buttons and labels ("Change password", not "Change Password").
- Buttons say what they do: "Register visitor", "Check in", "Save changes".
- Keep list descriptions to one short line. The module screen shows feature descriptions such as "Look up and register visitors".
- Refer to people and places the same way the web app does, so users recognise them across both apps.

---

## 8. Anti-patterns to avoid

- Adding routes in `app.tsx` for a feature, instead of registering the feature in its module
- Hard-coded colours, or antd-mobile's stock illustrations (they're blue); use the theme and `layout/status.tsx`
- Custom nav bars, `SafeArea` spacers, or `history.goBack()` on its own (use `Page` / `useNavigateBack`)
- Desktop patterns: tables, multi-column forms, hover-only affordances, numbered pagination, inline filter panels
- Opening a detail screen in a modal; full screens with a back arrow are the pattern
- More than two icon actions in the nav bar
- `history.push` after a save (it puts the form back on the history stack)
- Treating UI permission checks as security
- Importing CSS from `.tsx` files under `imports/ui`

---

## 9. Checklist for a new screen

- [ ] Registered as, or inside, a `FeatureDefinition` with the right permissions
- [ ] Wrapped in `Page` with a clear `title` and `backTo`
- [ ] Uses path constants, not string routes
- [ ] Loading, empty, error and no-access states use `layout/status.tsx`
- [ ] Lists have search, pull-to-refresh and infinite scroll where the data can grow
- [ ] Forms are single-column, with pickers for choices, validation messages and a descriptive submit label
- [ ] Destructive actions are confirmed
- [ ] No hard-coded colours; page CSS is in a `*.styles.css` loaded from `client/main.tsx`
- [ ] Checked at phone width (e.g. iPhone 13 emulation) in the browser build
