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
| Toasts (success, error, warning, info) | `idreesia-mobile/imports/ui/layout/toast.tsx` |
| User-readable error text | `idreesia-mobile/imports/ui/utilities/describe-error.ts` |
| Back navigation | `idreesia-mobile/imports/ui/layout/navigation.tsx` |
| Tab bar | `idreesia-mobile/imports/ui/layout/tab-bar.tsx` |
| Module / feature types | `idreesia-mobile/imports/ui/apps/types.ts` |
| Module registry | `idreesia-mobile/imports/ui/apps/registry.ts` |
| Permission rules | `idreesia-mobile/imports/ui/apps/access.ts` |
| Example module (Security → Visitors) | `idreesia-mobile/imports/ui/apps/security/` |
| List screen (search, filters, paging) | `idreesia-mobile/imports/ui/apps/security/visitors/visitors-list-screen.tsx` |
| List row | `idreesia-mobile/imports/ui/apps/security/visitors/visitor-list-item.tsx` |
| Camera capture (Cordova + browser) | `idreesia-mobile/imports/ui/utilities/capture-photo.ts` + `imports/ui/components/camera-view.tsx` |
| Photo search screen | `idreesia-mobile/imports/ui/apps/security/visitors/photo-search-screen.tsx` |
| Single-date report | `idreesia-mobile/imports/ui/apps/security/stay-report/stay-report-screen.tsx` |
| Detail screen | `idreesia-mobile/imports/ui/apps/security/visitors/visitor-detail-screen.tsx` |
| Keeping a list alive under its detail | `idreesia-mobile/imports/ui/apps/security/visitors/visitors-feature.tsx` + `imports/ui/layout/keep-alive.tsx` |
| Paged query → infinite list | `idreesia-mobile/imports/ui/hooks/use-paged-query.ts` + `imports/ui/components/paged-list.tsx` |
| Workspace screens (opened from the Workspaces tab) | `idreesia-mobile/imports/ui/workspaces/` + `workspaces-stack.tsx` |
| Form screen | `idreesia-mobile/imports/ui/account/change-password-screen.tsx` |
| Public chat (signed out, Rocket.Chat) | `idreesia-mobile/imports/ui/chat/` |
| Message composer (text, camera, files, voice notes) | `idreesia-mobile/imports/ui/components/message-composer/` |
| Committee discussion (signed in) | `idreesia-mobile/imports/ui/workspaces/discussions/` |
| Committee meetings (list → meeting → parts, bottom-sheet forms) | `idreesia-mobile/imports/ui/workspaces/meetings/` |
| Committee polls (voting on the poll screen with a pinned submit, results with progress bars, question editor in a bottom sheet) | `idreesia-mobile/imports/ui/workspaces/polls/` |
| Committee documents (folder drill-down with library-wide search, presigned uploads, document → versions / activity, trash, move via a folder-picker sheet) | `idreesia-mobile/imports/ui/workspaces/documents/` |
| Offline data (saved Apollo cache) | `idreesia-mobile/imports/startup/apollo-persist.ts` |
| Online / offline status | `idreesia-mobile/imports/ui/hooks/use-online-status.ts` |
| Offline files (save, open, remove; Cordova file storage) | `idreesia-mobile/imports/ui/offline/` |
| Offline file screens (save / badge / storage list) | `idreesia-mobile/imports/ui/workspaces/documents/document-screen.tsx` + `imports/ui/account/offline-files-screen.tsx` |
| Shared CSS | `idreesia-mobile/client/main.css` |
| Page CSS example | `idreesia-mobile/imports/ui/account/account-screen.styles.css` |

---

## 1. App structure: modules and features

The mobile app uses the same functional modules as the web app (`ModuleNames` / `ModulePaths` in `idreesia-common/constants`). Each module contains **features**, which are use cases such as Security → Visitors.

```
Home tab (/home)                         ← default after signing in; empty for now
Workspaces tab (/workspaces)             ← the user's workspaces, each expanding to its features
├── Workspace members (/workspaces/committees/:committeeId/members)   ← imports/ui/workspaces; the Workspaces list stays alive under it
├── Workspace discussion (/workspaces/committees/:committeeId/discussions)   ← DiscussionFeature; main list stays alive under:
│   ├── …/discussions/threads/:threadId
│   ├── …/discussions/search
│   ├── …/discussions/pinned
│   └── …/discussions/starred
├── Workspace Meetings (/workspaces/committees/:committeeId/meetings)   ← MeetingsFeature; the list stays alive under a meeting, and the meeting under its parts:
│   ├── …/meetings/new                    ← form (coordinators)
│   └── …/meetings/:meetingId             ← one meeting: summary, your response, rows for its parts
│       └── …/meetings/:meetingId/{edit,agenda,participants,minutes,attachments,action-items,activity}   ← item forms open in bottom Popups, not deeper screens
├── Workspace Polls (/workspaces/committees/:committeeId/polls)   ← PollsFeature; the list stays alive under a poll, and the poll under its parts:
│   ├── …/polls/new                       ← form (coordinators); questions are edited in a bottom Popup
│   └── …/polls/:pollId                   ← one poll: summary, the questions to vote on (pinned "Submit vote"), rows for its parts
│       └── …/polls/:pollId/{edit,results,voters,activity}   ← voters and activity are for coordinators
├── Workspace Documents (/workspaces/committees/:committeeId/documents)   ← DocumentsFeature; the top level stays alive underneath, the last folder under a document opened from it, and the document under its parts:
│   ├── …/documents/folders/:folderId     ← one folder: subfolders and documents; the search box searches the whole library
│   ├── …/documents/trash                 ← restore; delete forever / empty trash (coordinators)
│   └── …/documents/files/:documentId     ← one document: details, check-out state, pinned "Open document"; other actions in the "more" ActionSheet
│       └── …/documents/files/:documentId/{versions,activity}   ← forms (new folder, rename, edit, move) open in bottom Popups
├── Workspace Night Stay Report (/workspaces/committees/:committeeId/night-stay-report)   ← NightStayReportFeature; read-only, one night at a time; report stays alive under:
│   └── …/night-stay-report/:stayId   ← one stay, with a large photo
└── Workspace Security Server Alerts (/workspaces/committees/:committeeId/security-server-alerts)   ← read-only, one day at a time
Apps tab (/apps)                         ← lists the user's modules
└── Security (/security)                 ← module screen, lists its features
    └── Visitors (/security/visitors)    ← feature; owns every route below it
        ├── /security/visitors/:id       ← detail
        └── /security/visitors/new       ← form
Account tab (/account)
└── Change password (/account/change-password)
```

- **Modules** are declared as `ModuleDefinition`s and registered in `apps/registry.ts`. Only add a module to the mobile app once it has at least one mobile feature.
- **Features** are `FeatureDefinition`s inside their module. Each one has a `path` under the module's path, a list of `permissions`, and a `component`. The component owns every route under its path, so it renders its own `<Switch>` for list, detail and form screens.
- **Visibility follows permissions.**
  - A feature is shown when the user has **any** of its permissions (`Permissions` from idreesia-common).
  - A module is shown when the user can use at least one of its features. On the web, a module only needs one permission with the module's prefix; on mobile, a module with nothing usable in it would be a dead end.
  - `FeatureGate` blocks deep links to features the user can't use.
  - Hiding things in the UI isn't security. The server still enforces permissions on every query and mutation.

### Adding a feature

1. Create `apps/<module>/<feature>/` containing the feature component and its screens.
2. Add its path to `apps/<module>/paths.ts`, always under `ModulePaths.<module>`.
3. Add a `FeatureDefinition` to the module's `features`. Give it a title, a one-line description, an `antd-mobile-icons` icon, its path, its permissions and its component.
4. The routes, the module screen entry and the permission gate come for free. Don't add routes to `app.tsx`.

### Adding a module

1. Create `apps/<module>/index.tsx` exporting a `ModuleDefinition` that uses the shared `ModuleNames` / `ModulePaths` values.
2. Add it to `modules` in `registry.ts`. The list order is the display order.

---

## 2. Navigation

- **Tab bar:** Home, Workspaces, Apps and Account are the only top-level destinations, in that order. Home is the default screen after signing in. The tab bar shows only on their root screens. Don't add tabs per module; modules are listed on the Apps tab.
- **Drill-down:** every screen below a tab root is full-screen, with a back arrow in the nav bar. Keep the hierarchy to at most **module → feature → list → detail → form**. If you need more levels, rethink the flow, for example with a popup or tabs inside the detail screen.
- **Back:** set `backTo` on `Page` to the parent route. That gives the screen a back arrow and a swipe right from the left edge (`layout/use-swipe-back.ts`), on every platform; both run the same back action. `useNavigateBack` uses `history.goBack()` when the user got there within the app, which keeps Android's hardware back button in step. On a deep link or after a reload, it replaces the current route with the parent, so the back arrow never leaves the app.
- **Coming back keeps the screen as it was:** a list (or search) that opens a detail screen stays mounted underneath it inside `KeepAlive`, so back shows the same search, loaded pages and scroll position. The feature component decides which screens are still in the back stack; see `visitors-feature.tsx`. When another feature opens a record (e.g. the stay report opening a visitor), route the detail screen under that feature's own path (`/security/stay-report/:visitorId`) and reuse the screen component with its `backTo`, so the opening screen stays alive; see `stay-report-feature.tsx`. Don't store screen state in module variables or the URL to fake this.
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

**Exception: the public chat** (`imports/ui/chat`, `/chat`). It needs no login, so it isn't a module or feature, and it is linked from the sign-in screen's footer ("Need help? Message us"). Because it's a full conversation screen, it uses `Page` (with `backTo="/login"`) rather than `AuthLayout`. It talks to Rocket.Chat's Livechat visitor API directly (`public.rocketChatUrl`), not the ERP backend. Other signed-out pages that need a full screen should follow the same pattern.

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
- **Filters:** leave them out unless the feature needs them; one good search box usually does the job (the Visitors list has none). If a list does need filters, put them in a bottom `Popup` opened from a filter icon in the nav bar's `right` slot. Put a `Badge` with the active-filter count on that icon, and show active filters as closable `Tag`s under the search bar. Don't show inline filter forms.
- **One date instead of a search:** for a report that shows one day (e.g. the stay report), put a date bar in the `list-toolbar`: previous / next day buttons either side of the date, and tapping the date opens a `DatePicker`. Default to today. See `stay-report-screen.tsx`.
- **Paging:** paged GraphQL queries take `pageIndex` / `pageSize` in their `filter` and return `{ totalResults, data }`. For older queries that take a `queryString` instead (e.g. `pagedVisitorStays`), pass `toVariables` to `usePagedQuery`. Their server-side sort needs a unique tie-breaker (e.g. `_id`), or pages overlap.
- **Photos:** `getBackendFileUrl(imageThumbnailId ?? imageId)` from `/imports/startup/backend`. The web's `getDownloadUrl` points at the app's own origin, not the backend.
- **Loading more:** use `PullToRefresh` around the list and `InfiniteScroll` below it. Don't use numbered pages.
- **Row actions:** tapping a row opens its detail screen. Put the one or two most common actions in `SwipeAction`; everything else goes on the detail screen.
- **Creating a record:** an add icon in the nav bar, or a pinned `footer` button if creating is the main job of the screen.
- **States:** show `PageLoading` on the first load, `PageEmpty` when there are no results (with a create action if the user can create), and `PageError` with `onRetry` on failure. Show `PageError` only when there is nothing to show: if the cache has data, show it (see [Offline support](#9-offline-support)).

### Detail screen

- **Layout:** the title is the entity's name.
  - A summary card with a large photo (160 px, centred, so a face can be matched), then the name, key identifiers and tags under it;
  - then **one** compact card of label / value rows (a `<dl>`: label on the left, value on the right), in the same order and with the same labels as the web's form for that record. See `visitor-detail-screen.tsx` and its `.styles.css`.
  - No section headers, and not one card per section; `List.Item` with a `title` stacks the label over the value and doubles the height. Leave out audit fields (created/updated) unless the feature needs them.
- **Fields:** leave out empty fields; don't show dashes. Show dates as `DD-MM-YYYY`, and durations the way the web shows them ("5 years, 6 months").
- **Photos:** use the full image (`imageId`), not the thumbnail, and let a tap open it in a declarative `<ImageViewer visible>`. Don't use `ImageViewer.show()`: it stays open after the user navigates away.
- **Read-only screens** have no footer; add actions only when the feature needs them.
- **Actions:** for up to two actions, use a pinned `footer` (primary button, plus an outline secondary button if needed). For more, use an `ActionSheet` from a "more" icon.
- **Destructive actions:** confirm with `Dialog.confirm`, and use the danger colour for the confirm button.
- **Related lists:** show the first few items inline, with a "View all" item that opens a full list screen.

### Form screen

- **Layout:** antd-mobile `Form` with `layout="vertical"` and `mode="card"`, one field per row. Never put fields side by side.
- **Submit:** a primary block `Button` in the form's `footer`, with `loading` while saving and a label that says what it does ("Register visitor", not "Submit").
- **Choices:** use `Picker`, `CascadePicker` or `DatePicker` (opened from a `Form.Item` with `onClick`) instead of free-text fields. For lists that are too long for a picker, open a searchable selection screen.
- **Grouping:** for long forms, split the fields into several `Form` cards with `Form.Header`s. For more than about 8 fields, consider steps (`Steps`) instead of one long scroll.
- **Validation:** use `rules` on each `Form.Item`, with a message that tells the user what to do ("Please enter the CNIC."). Validate formats on the client, and show server errors with `showError`.
- **Keyboard:** set `type`, `inputMode`, `autoComplete` and `autoCapitalize` so phones show the right keyboard.

### Camera screens

- Take photos with `capturePhoto()` (`imports/ui/utilities`). It is **camera-only**: users can't pick an existing image.
  - In the browser and the iOS app it shows `CameraView`, a full-screen live viewfinder with a shutter button and, on devices with more than one camera, a switch-camera button (back camera first; the front camera's preview is mirrored, the photo isn't). In the iOS app this avoids the native camera screen, which left the app blank for about 2 seconds after each photo. The local plugin `cordova-plugins/idreesia-webview-camera` stops iOS asking for camera permission again on every launch.
  - In the Android app it uses cordova-plugin-camera with the camera as the only source, until `CameraView` has been tested in Android's WebView.
  - It never uses a file input, which would also offer the gallery.
  - **Exception: the public chat** (`imports/ui/chat`) also has a paperclip attach button that opens the system picker through a hidden `<input type="file" multiple>`. On iOS that offers Photo Library, Take Photo and Choose Files; on Android, the WebView's file chooser. Customers sending a message may share existing photos and documents, while record-keeping features (visitor photos) stay camera-only.
  - **Exception: Meetings attachments** (`imports/ui/workspaces/meetings/attachments-screen.tsx`) use a hidden `<input type="file" multiple>`, like the public chat, because they are documents (agendas, reports, PDFs) rather than photos taken for a record. Files go straight to storage through a presigned URL, and open in a full-screen preview as in Discussions.
  - **Exception: Documents** (`imports/ui/workspaces/documents`) uses the same hidden file input for uploads and new versions, for the same reason as Meetings attachments; documents open in the same full-screen preview.
  - **Exception: Monitoring Profiles** (`imports/ui/workspaces/monitoring-profiles`) also lets users pick a photo from the gallery with `pickPhoto()` (`imports/ui/utilities`), offered next to "Take photo" in an `ActionSheet`. Enrollment photos of a watched person usually already exist, and the server rejects any photo without exactly one usable face. `pickPhoto()` uses cordova-plugin-camera's photo library on Android and an image-only file input elsewhere (the system photo picker on iOS), and returns the same scaled JPEG data URL as `capturePhoto()`. Other features stay camera-only unless asked otherwise.
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
| Action succeeded (saved, deleted) | `showSuccess('Folder renamed.')`, then go back |
| Action failed | `showError(error, 'Could not upload the file.')` |
| The user has to fix something first (client-side check) | `showWarning('Please add at least 2 options.')` |
| Neutral information or a hint | `showInfo('Hold to record, release to send.')` |
| Irreversible or destructive action | `Dialog.confirm` before doing it |
| Flow finished and the user needs next steps | `Result` screen |
| Screen loading / empty / failed / not allowed | `PageLoading` / `PageEmpty` / `PageError` / `NoAccess` |
| Backend connection lost | Handled globally by `NoticeBar` in `app.tsx` ("Offline. Showing saved data…"); don't duplicate it. Disable actions that need the server with `useOnlineStatus()` (see [Offline support](#9-offline-support)) |
| A file isn't saved on the device and the user is offline | `showWarning("This file isn't available offline…")`, naming what to do about it |
| Button action in progress | `loading` on the button; disable double submits |

- Never render `null` while loading, and never leave a blank screen.
- **Toasts** come from `layout/toast.tsx`, never antd-mobile's `Toast.show` directly. Its stock toast is a narrow, centred box that breaks words in half. Ours is a full-width card under the nav bar: a coloured icon, a bold line saying what happened and, for errors, a second line saying why. Tapping it dismisses it, and errors stay up longer (4.5 s) so there's time to read them.
- **Error text has two parts.** The `title` you pass says what failed, naming the thing when it helps (`Could not upload "minutes.pdf".`). The detail line comes from the error itself, through `describeError`:
  - the server's `reason` / `message` is shown as written, so write server errors for users ("The face is too small. Move closer and retake.");
  - lost connections, from any layer (Apollo, fetch, XHR), read "Check your internet connection and try again.";
  - technical text (status codes, JS errors, "Internal server error") is dropped, and the detail falls back to "Please try again.".
- Errors you throw on the client to reach a `showError` should explain the cause, not repeat the title ("It is larger than the 25 MB limit.", not "Could not upload the file.").
- `getErrorMessage(error, fallback)` uses the same rules for inline text, such as `PageError`'s description.

---

## 6. Theme and CSS

- **Colours, radii and fonts** come only from `imports/ui/theme/theme.ts`.
  - In CSS use `var(--app-color-…)`, `var(--app-radius-…)` and `var(--app-elevation)`.
  - In code import `palette` from `/imports/ui/theme`.
  - Never hard-code a colour.
- **Feature icons are coloured tiles.** A workspace's expanded features (Members, Meetings, …) show their icon in white on a rounded 32 px tile, one `feature*` palette colour per feature (`workspace-feature-icon-<key>` in `workspaces-screen.styles.css`). Other lists keep the plain teal `list-icon`.
- **Components before custom styling.** Prefer antd-mobile props such as `color="primary"` and `fill="outline"`. antd-mobile components are already themed through the `--adm-*` variables.
- **Shared chrome** (shell, status states, auth, list icons) lives in `client/main.css`.
- **Page-only rules** go in `*.styles.css` next to the screen, **imported only from `client/main.tsx`**. This is the same Meteor rule as the web: don't import CSS from `.tsx` files, and don't give a CSS file the same basename as a `.tsx` file.
- **Icons:** use `antd-mobile-icons` only, in outline style. Leading list icons use the `list-icon` class. When the set has no suitable icon (e.g. a house for the Home tab), add one to `imports/ui/components/icons/` that follows its conventions (48×48 grid, 3px outline, `currentColor`, `antd-mobile-icon` class); see `home-outline.tsx`.
- **Touch targets** are at least 44 px high. Screens are portrait-only.
- **Text size follows the phone's setting** (iOS Dynamic Type, so Larger Text works for people who need it). `imports/ui/theme/text-scale.ts` sets the root font size from the system body size: 17px at the default, capped at 1.6× so nav bars, the tab bar and the chat composer don't break. Android stays at the default for now.
  - Size **text in `rem`** (1rem = 17px at the default; write the px value in a comment, e.g. `font-size: 0.8824rem; /* 15px */`). antd-mobile's `--adm-font-size-*` variables are re-declared in rem in `client/main.css`.
  - Keep **icons, avatars and touch targets in `px`**, so they stay inside their buttons at large text sizes.
  - Check new screens at the largest non-accessibility size and at an accessibility size (Settings → Accessibility → Display & Text Size → Larger Text).
- **Locale:** antd-mobile's built-in text defaults to Chinese. `client/main.tsx` sets English globally with `setDefaultConfig({ locale: enUS })`, which also covers `Dialog` and `Toast`.

---

## 7. Copywriting

- Use sentence case for titles, buttons and labels ("Change password", not "Change Password").
- Buttons say what they do: "Register visitor", "Check in", "Save changes".
- Keep list descriptions to one short line. The Apps tab's module screens show feature descriptions such as "Look up and register visitors".
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
- Showing `PageError` when cached data exists, or `network-only` queries for data people should be able to read offline
- Letting a write action run offline (it fails with a network error), instead of disabling it
- Saving presigned URLs, or files outside `imports/ui/offline`, for offline use; saving files without the user choosing to

---

## 9. Offline support

The app can be used offline for reading. Data comes from a saved copy of the Apollo cache; files are only available if the user chose to save them.

### Data

- **The cache is saved on the device** (`imports/startup/apollo-persist.ts`, IndexedDB). It is saved shortly after responses and when the app goes to the background, and restored before the first render. It belongs to one user: a different user, or no user, discards it, and logout wipes it. Bump `CACHE_SCHEMA_VERSION` when persisted data can no longer be read after a change.
- **Anything the user has already opened can be read offline**, including paged lists (only the pages they loaded). A screen the user has never opened has nothing to show offline; say so with `PageEmpty`, not a blank screen.
- **Show cached data, not an error.** Offline, a `cache-and-network` query returns the cached `data` together with a network `error`. A screen must check `error && !data` before showing `PageError`, or hide the error while data exists in its hook (`error: document ? undefined : error`, as `useDocument` does; `usePagedQuery` does the same).
- **Use `cache-and-network` (or the default) for data people read.** `network-only` shows nothing offline. If a loader must use it (the Home tab), fall back to `fetchPolicy: 'cache-only'` when the request fails, as `home/use-home-items.ts` does. `cache-only` returns an empty result, not an error, when nothing is saved.
- **Don't poll offline.** A failed poll should back off, not show an error toast.

### Writes

- **Offline is read-only.** Don't queue changes. Call `useOnlineStatus()` (`imports/ui/hooks`) and:
  - set `disabled: !online` on `ActionSheet` actions (new, edit, move, delete, check-out…);
  - leave out `SwipeAction` row actions;
  - hide nav-bar icons that only write (e.g. "Empty trash").
- **Reading screens stay available** (a trash list, versions, details). Only their actions are disabled.
- The online status is "can the app reach the server": it is false when the device has no network or the connection to the server is down. The global banner already says so; don't add another.

### Files

- **Files are not available offline by default.** A module opts in by calling `imports/ui/offline`; nothing is saved without the user choosing to. Today only Documents does.
- **The pattern** (see `documents/document-screen.tsx`):
  - an `ActionSheet` action: "Make available offline", "Update offline copy" when a newer version exists, and "Remove offline copy";
  - a progress card with a Cancel button while saving (reuse the `documents-card documents-upload` classes);
  - a `Tag` on the detail screen and on list rows (`extra`): green "Offline" for a current copy, amber "Offline (old)" or "Offline copy is out of date" for an old one;
  - **open the saved copy first**, and the network only when there is none; offline with no copy, `showWarning` that the file isn't available offline and how to fix it.
- **Always guard with `isOfflineStorageAvailable()`.** It is false outside a Cordova app, where there is nowhere to keep files; hide the actions rather than showing ones that fail.
- **How it works.** `saveOfflineFile` streams the response to a `.part` file in the app's private storage, checks the exact size, then moves it into place. Files live under `offline/<userId>/<feature>/<committeeId>/<itemId>/…`, listed in a per-user manifest. `useOfflineItem(feature, itemId)` / `useOfflineFiles()` give React state; `readOfflineFile` returns a `Blob` to open with `URL.createObjectURL` (revoke it when the preview closes).
- **Rules:**
  - Fetch the file straight away. Presigned URLs expire (about 15 minutes), so never store one.
  - Download once, on the user's action, so each save is one entry in the server's download log; opening a saved copy logs nothing.
  - Remove the saved copy when its item is deleted (`removeOfflineItem`).
  - Logout deletes everything, and startup removes files left by other users. You don't need to do this yourself.
  - Keep the storage out of the module: don't write to `cordova.file` or `localStorage` directly.
- **Account → Offline files** lists everything saved, with sizes, and lets the user remove one or all. A new module's files appear there automatically if it passes a `name`, `size` and `committeeId`.

### Adding offline files to a module

1. Pick a `feature` name and an `itemId` / `fileId` (use a version number as `fileId` when files change, e.g. `v3`, and set `version`).
2. Save with `saveOfflineFile(file, signal => fetch(url, { signal }), { onProgress, signal })`; wrap it in a hook like `useOfflineDocument`.
3. In the open action, look up `findOfflineFile(feature, itemId, version)` first and use `readOfflineFile`.
4. Add the actions, tags and "isn't available offline" message above.
5. Remove the saved copy when the item is deleted.
6. Check the bucket's CORS rule allows `GET` from the app's origin (the save uses `fetch`).

---

## 10. Checklist for a new screen

- [ ] Registered as, or inside, a `FeatureDefinition` with the right permissions
- [ ] Wrapped in `Page` with a clear `title` and `backTo`
- [ ] Uses path constants, not string routes
- [ ] Loading, empty, error and no-access states use `layout/status.tsx`
- [ ] Lists have search, pull-to-refresh and infinite scroll where the data can grow
- [ ] Forms are single-column, with pickers for choices, validation messages and a descriptive submit label
- [ ] Destructive actions are confirmed
- [ ] Offline: cached data is shown instead of an error, and write actions are disabled with `useOnlineStatus()`
- [ ] Files stay online-only unless the module has been opted in to offline files
- [ ] No hard-coded colours; page CSS is in a `*.styles.css` loaded from `client/main.tsx`
- [ ] Checked at phone width (e.g. iPhone 13 emulation) in the browser build
