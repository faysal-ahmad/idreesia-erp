# UI Design Guidelines

Conventions for building list pages and edit/new form pages in `idreesia-web`, so layout, chrome, and interaction patterns stay consistent across modules. Distilled from the Security **Visitor Registration** list and edit implementation — treat it as the canonical reference.

**Field contents vary by entity.** Reuse the layouts, shared CSS classes, and UX rules below — not the visitor-specific fields themselves.

---

## Reference implementation

| Area | Location |
|------|----------|
| List page wiring | `idreesia-web/imports/ui/modules/security/visitor-registeration/list/list.tsx` |
| Stay report list (same list guidelines) | `idreesia-web/imports/ui/modules/security/visitor-stay-report/list.tsx` |
| Simple setup list + modal create | `idreesia-web/imports/ui/modules/security/setup/mehfil-duties/list.tsx` |
| Entity list + modal create + scroll.y | `idreesia-web/imports/ui/modules/security/mehfils/list.tsx` |
| Nested list (selection + duty filter) | `idreesia-web/imports/ui/modules/security/mehfil-karkuns/list.tsx` |
| Shared list table | `idreesia-web/imports/ui/modules/common/visitors/list.tsx` |
| Shared list filter + chips | `idreesia-web/imports/ui/modules/common/visitors/list-filter.tsx` |
| Edit shell (tabs, breadcrumbs, loading) | `idreesia-web/imports/ui/modules/security/visitor-registeration/edit/edit-form.tsx` |
| Shared edit form layout | `idreesia-web/imports/ui/modules/common/visitors/general-info.tsx` |
| Shared new form (wraps edit layout) | `idreesia-web/imports/ui/modules/common/visitors/new-form.tsx` |
| Security new visitor page | `idreesia-web/imports/ui/modules/security/visitor-registeration/new/new-form.tsx` |
| Picture side panel | `idreesia-web/imports/ui/modules/security/visitor-registeration/edit/picture.tsx` |
| Audit footer | `idreesia-web/imports/ui/modules/common/audit-info/audit-info.tsx` |
| Shared list / audit CSS | `idreesia-web/client/main.css` (`.list-*`, `.audit-info`) |
| Visitors list CSS | `idreesia-web/imports/ui/modules/common/visitors/list.styles.css` |
| Visitor form CSS | `idreesia-web/imports/ui/modules/common/visitors/general-info.styles.css` |
| Visitor picture CSS | `idreesia-web/imports/ui/modules/security/visitor-registeration/edit/picture.styles.css` |
| CSS entry | `idreesia-web/client/main.tsx` (imports page CSS; do not import CSS from `.tsx` under `imports/ui`) |
| Sidebar URL sync | `idreesia-web/imports/ui/modules/security/sidebar.tsx` |

---

## Part A — List pages

### 1. Toolbar layout

Split primary actions (left) from utilities (right). Utilities stack **filter controls** above **active filter chips**.

```tsx
<div className="list-table-header">
  <Space size={12}>
    {/* Primary actions: New, Scan, etc. */}
  </Space>
  <div className="list-table-header-utilities">
    <Space size={8}>
      <ListFilter {...filterProps} />
      {/* Optional: settings / download menu / simple Select filters */}
      <Button icon={<SyncOutlined />} onClick={handleRefresh} title="Reload Data" />
    </Space>
    <FilterChips {...filterProps} />
  </div>
</div>
```

**Placement:**

- When using viewport-measured `scroll.y`, put the toolbar in the Table `title` so height measurement includes it (see visitors / mehfils / mehfil-karkuns).
- Short setup lists that omit `scroll.y` may keep the toolbar as a sibling above the table (mehfil-duties).

**Shared classes** (in `main.css`):

- `list-table-header` — full-width row, space-between
- `list-table-header-section` — left action cluster
- `list-table-header-utilities` — right column, end-aligned, chips underneath

Always include **Refresh** (`SyncOutlined`) in utilities, even when the list has no Filter popover.

### 2. Filter UX

- Prefer **Popover** over Collapse / always-visible filter forms for multi-field filters
- Trigger: **Filter** button with `FilterOutlined`
- Wrap in `Badge` with `count={activeFilterCount}`
- Place **Refresh** (`SyncOutlined`) beside Filter
- Popover: `trigger="click"`, `placement="bottomRight"`
- On open, sync form fields from current query params
- Override global `form { width: 600px }` inside the popover with `list-filter-panel` (640px)
- Keep a single primary **Search** submit; do **not** add Reset when chips provide **Clear all**
- Gate optional filter fields with props (enable only what that list needs)
- A single domain Select in utilities is fine when that is the only filter (e.g. duty on mehfil-karkuns) — no need to force a Filter popover

### 3. Active filter chips

- Render under filter/refresh (right side), not inside the popover
- Closable tag per active filter; clear that param and reset `pageIndex` to `0`
- **Clear all** link when any chips exist
- Hide the chips row when there are no active filters

### 4. Table UX

| Setting | Value |
|---------|--------|
| `className` | `list-table` (wrapper: `list-container`) |
| `size` | `"middle"` |
| `bordered` | `true` |
| `tableLayout` | `"fixed"` |
| Pagination | In `footer`, not on Table |
| `scroll.y` | Viewport-measured when useful |
| Loading | Centered `Spin` — never blank `null` |
| Delete | Prefer `Popconfirm` before destructive remove |

**`scroll.y` measurement** (when used):

- Measure after layout (`requestAnimationFrame`); re-run on resize and after content changes that alter title/footer height
- Height = content padding-box bottom − title bottom − thead − footer − small gap (see `common/visitors/list.tsx` / `mehfils/list.tsx`)
- Use `Layout.Content`'s padding box as the bottom limit (not `window.innerHeight` alone), or pagination clips when the title grows
- Inside a `Drawer` (e.g. the Karkuns selection list), bound by the nearest `.ant-drawer-body` instead of `.ant-layout-content` — same formula, different ancestor (see `common/people/list.tsx`)
- Minimum body height ~200px; only update state when the delta is > ~2px to avoid thrash
- Do not override `.ant-table-header` overflow; antd syncs the scrollbar gutter

**Pagination:**

- Server-paged lists: footer drives query `pageIndex` / `pageSize`
- All-at-once lists (e.g. mehfils, mehfil-karkuns): client-slice the array for the footer; still use footer `Pagination`, not Table's built-in pager
- With `rowSelection` + client paging: merge selections across pages (keep other pages' keys; replace only the current page's selection)

**Selection column** (when a list uses `rowSelection` + `scroll.y`): Ant Design often ignores `rowSelection.columnWidth`; lock it via CSS instead — shared `list.styles.css` fixes `.ant-table-selection-col` / `.ant-table-selection-column` to `48px` (`width` / `min-width` / `max-width`). Prefer this over sticky columns for this layout.

**Shared table palette** (`.list-table` in `main.css`):

- Outer / header / footer edge: `#d0d5dd`
- Inner column & row lines: `#cfd4dc`
- Header fill: `#f3f4f6`, text `#344054`
- Row hover: `#f5f9ff`
- Do **not** put column widths or selection-column locks in `main.css`

**Page-specific CSS** (colocated next to the UI module, imported from `client/main.tsx`):

- Row tinting (e.g. warning/alert backgrounds)
- Selection column width locks when that page uses `rowSelection` + `scroll.y` — target `.ant-table-selection-col` / `.ant-table-selection-column` only (never `:first-child`)
- Note: visitors `list.styles.css` currently locks selection on all `.list-table` tables; reuse that unless a page needs different widths
- Any other column-width CSS for that page

**Tag chips in a person's Name column** (list pages backed by `PersonName`, e.g. `common/visitors/list.tsx`): when a person can carry tags, render them right-aligned in the same Name column rather than as a separate column — wrap `PersonName` and the tag chips in a flex row (`justify-content: space-between`), render each tag with antd `Tag` (`variant="solid"`, `color`/`textColor` from the tag record). This is a Name-column convention specific to lists that show people, not a general list-column pattern.

### 5. Modal create (simple / setup lists)

Prefer **create-in-modal on the list** when the new form is a few fields and there is no need for a full edit shell after create:

- Parent owns `Form.useForm`, Modal `open` / OK / Cancel / `confirmLoading`
- `new-form.tsx` is fields only (no Save/Cancel buttons, no route)
- OK → `validateFields` → mutation → toast → close + reset; stay on the list
- Do not add a `/new` route, submodule path, or export for this pattern
- Keep a separate **edit** route when the entity still has a full edit page (e.g. mehfils)

Use a **full new page** (Part B §7) when create reuses a large sectioned form or should land on edit after create (e.g. visitors).

References: `setup/mehfil-duties`, `setup/mehfil-langar-dishes`, `setup/mehfil-langar-locations`, `mehfils`.

### 6. List checklist

1. Toolbar with `list-table-header` + utilities (in Table `title` when using `scroll.y`)
2. Filter Popover + badge when multi-field filters; Refresh always; chips + Clear all; no form Reset
3. `list-container` / `list-table`; middle, bordered, footer pagination; `Spin` while loading
4. Viewport-measured `scroll.y` when the list can grow; omit only for tiny setup tables
5. Modal create for simple entities; full new page only when Part B §7 applies
6. Shared CSS in `main.css`; page CSS next to the module, loaded from `client/main.tsx`
7. Smoke-test apply/clear filters, vertical scroll, selection across pages, create/delete

---

## Part B — Edit / new form pages

Form **fields** differ by entity. Reuse this **shell and section layout**.

### 1. Edit shell

- **Breadcrumbs:** use `useDynamicBreadcrumbs` so the last crumb can show the entity name after load (e.g. `Security / Visitor Registration / {name}`), not a static `"Edit"`
- **Loading:** centered `Spin` while the by-id query loads — never a blank `null`
- **Not found:** `Empty` when load finishes without a record
- **Tabs:** only for truly separate concerns (e.g. Stay History). Prefer consolidating related fields onto the primary tab
- **URL-synced tabs:** semantic keys (`general`, `stays`), controlled via `?default-active-tab=`; update URL on change. Avoid bare numeric keys that collide with legacy mappings
- **Cancel** returns to the list; **Save** stays on the page with a success toast (stay-on-save)

### 2. Sectioned form layout

Group fields into collapsible sections with Ant Design `Collapse` (not flat Dividers).

**Recommended section pattern** (names adapt per entity):

1. **Personal Information** (or Identity) — core identity fields
2. **Contact Information** — phones, city/country, addresses as appropriate
3. **Domain-specific block** — e.g. Ehad & Education, employment, etc.
4. **Notes / risk** (when relevant) — free-text notes, with badges/alerts for important flags

**Collapse rules:**

- Use shared chrome class `visitor-form-sections` (or a renamed shared equivalent when extracting further)
- `forceRender: true` on panels so collapsed fields still submit/validate
- Default: sections open
- Header styling aligned with list chrome: `#f3f4f6` header, `#d0d5dd` border, 8px radius, semibold 14px title

### 3. Side panel beside Personal Information (optional)

For entities with a photo / avatar:

- Place a **non-collapsible** side panel to the **right** of the Personal Information collapse
- No title bar on the picture panel — preview + actions only
- Layout: flex row (`visitor-form-personal-row`); side panel ~280px
- Widen the form wrapper when side content is present (`visitor-form-with-side`, max-width ~960px); standard forms stay ~600px (`visitor-form`)
- Upload button label: short (**Upload**), not "Upload Picture"
- Empty state when no image (no broken `img`)

### 4. Additional Information section (notes / risk signals / tags, when applicable)

- Prefer an **"Additional Information" section on the main form**, not a separate tab — covers free-text notes/risk fields and, where relevant, a Tags multi-select
- Badge on the section header when notes/risk fields have content (error stronger than warning)
- Short `Alert` banners above the fields when content exists
- A Tags field on this section should only offer/display tags scoped to the current module (e.g. a `moduleNames` match); tags assigned via other modules are not shown or editable here — see `common/visitors/general-info.tsx` for the pattern (module-filtered options + preserving other modules' tag ids unseen on save)
- Save notes/tags with the main form save (one Save for the tab)

### 5. Form actions & audit footer

- Single **Save** / **Cancel** under the sections (`FormButtonsSaveCancel` with `fullWidth` so buttons sit flush-right under full-width section cards)
- Disable Save until fields are touched; clear touched state after successful save
- **AuditInfo** below the form, inside the **same width wrapper** as the form (not full page width)
- Audit styling (`.audit-info` in `main.css`): quiet metadata — light `#f9fafb` fill, `#d0d5dd` border, 8px radius, small uppercase labels + name · date

### 6. Nested / related lists on edit

When an edit tab embeds a list (e.g. Stay History), apply the same **Part A** list chrome (`list-container`, `list-table`, `list-table-header`, `size="middle"`).

### 7. New forms

**Full new page** — reuse the same sectioned layout as edit (prefer wrapping the shared general-info form):

- Same collapse sections and `fullWidth` Save/Cancel alignment
- Defaults as needed (e.g. Country = Pakistan for new visitors)
- Omit picture / audit until after create when those belong on edit — but an Additional Information section (notes/tags) with no dependency on the record already existing can and should show on New too
- Cancel → list; on successful create, toast then navigate to the edit page
- Show `Spin` while lookup data (cities/countries) loads — not a blank page

**Modal create** — for short setup/entity creates, use Part A §5 instead of a `/new` route.

### 8. Edit / new checklist

1. Dynamic breadcrumbs (entity name on edit; "New" on create page)
2. Spin / Empty instead of blank render
3. Collapse sections with shared header chrome; `forceRender` on panels
4. Optional picture side panel (non-collapsible, no title bar) beside Personal Information
5. Consolidate notes onto main tab when possible; badge + alerts for risk
6. Edit: stay-on-save + toast; Cancel → list. Full new page: toast + navigate to edit after create. Modal create: toast + stay on list
7. Semantic URL tab keys if multiple tabs remain
8. Form + AuditInfo share one max-width wrapper (hide audit on new if not applicable)
9. Page-specific CSS colocated next to the module; import from `client/main.tsx`

---

## CSS organization

### Shared (`client/main.css`)

| Class | Role |
|-------|------|
| `list-table-header` / `list-table-header-utilities` | List toolbar |
| `list-filter-chips` / `list-filter-panel` | Filter chips + popover width |
| `list-container` / `list-table` | Table chrome |
| `audit-info` / `audit-info-line` / `audit-info-label` | Edit form audit footer |

### Page-specific (colocated under `imports/ui/...`, loaded from `client/main.tsx`)

| File | Owns |
|------|------|
| `modules/common/visitors/list.styles.css` | Row tints, selection-column lock |
| `modules/common/visitors/general-info.styles.css` | Form width, side panel, collapse sections |
| `modules/security/visitor-registeration/edit/picture.styles.css` | Picture panel |

Put new page-only rules next to the component that owns the class names. Keep shared chrome in `main.css`.

**Name CSS `*.styles.css`** (not `list.css` beside `list.tsx`). Meteor's extensionless import of `./list` can resolve to the CSS module object and break React (`type is invalid… got: object`).

### Meteor CSS loading (important)

**Do** colocate `*.styles.css` next to UI modules under `imports/ui/...`.

**Do not** `import './foo.css'` from those modules' `.tsx` files, and **do not** use the same basename as a `.tsx` sibling.

Always load page CSS from `client/main.tsx` (or another client entry):

```ts
import '../imports/ui/modules/common/visitors/list.styles.css';
```

---

## Visual tokens (shared chrome)

Reuse these so lists and forms feel like one system:

| Token | Value |
|-------|--------|
| Border / edge | `#d0d5dd` |
| Inner table lines | `#cfd4dc` |
| Header / panel header fill | `#f3f4f6` |
| Header text | `#344054` |
| Muted text | `#667085` / `#98a2b3` |
| Soft surface | `#f9fafb` |
| Radius | `8px` |
| Row hover (tables) | `#f5f9ff` |

---

## Sidebar URL sync

Module sidebars should derive selection from the current pathname (not only from click handlers):

- `selectedKeys` from a path → menu-key map (most specific routes first)
- Keep all ancestor groups in `openKeys` when a nested child is active (e.g. Mehfil Management → Setup → Mehfil Duties); still allow manual expand/collapse
- When updating `openKeys`, only call `setOpenKeys` if the key **set** actually changed (avoid Menu "Maximum update depth" loops from always returning a new array)
- Sync `activeSubModuleName` from the URL so refresh / deep links keep the sidebar highlight; stabilize that setter with `useCallback` if it is a `setState` dependency
- Nested routes (edit/new/upload/karkuns) should highlight the parent list item, not a blank selection

Reference: `idreesia-web/imports/ui/modules/security/sidebar.tsx`

---

## App shell notes

- Shell should fill the viewport (`min-height: 100vh` / flex stretch on logged-in layout) so short pages still look full-height
- Prefer `scrollbar-gutter: stable` on `body` so table `scroll.y` recalculation is not thrashed by scrollbar appearance
- Error boundaries: show the error UI; do **not** call `resetErrorBoundary()` during render (that freezes the app)

---

## GraphQL / schema pitfalls (when building creates)

- GraphQL `String` date inputs that map to SimpleSchema `Date` fields must be converted with `new Date(...)` in the **resolver** before `insertAsync` / `updateAsync` (e.g. mehfils `mehfilDate`)
- Prefer returning timestamp strings from Date fields when the UI already does `dayjs(Number(value))`

---

## Anti-patterns to avoid

- Dumping page-only rules into `main.css` when they will not be reused
- Importing CSS from `.tsx` under `imports/ui` (file colocation is fine; load from `client/main.tsx`)
- Naming colocated CSS the same as a sibling module (`list.css` next to `list.tsx`)
- Sticky table columns unless selection/scroll behavior is re-verified
- Duplicate Reset + Clear all for the same filter state
- Numeric tab keys that fight legacy URL remapping
- Full-bleed audit/footer blocks wider than the form cards
- Purple/glow/dashboard clutter — stay aligned with Ant Design + shared chrome above
- Forcing a Filter popover when a single Select (or no filters) is enough
- Adding a `/new` route when create belongs in a list Modal
- Blank `null` loading states on list/edit shells
- Calling `resetErrorBoundary()` inside render
- Inserting GraphQL date strings into SimpleSchema `Date` fields without resolver conversion
