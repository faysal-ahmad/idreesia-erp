# UI Modernization Plan

Guidance distilled from the Security **Visitor Registration** list and edit modernization. Use this when updating other list and edit/new pages so layout, chrome, and interaction patterns stay consistent.

**Field contents vary by entity.** Reuse the layouts, shared CSS classes, and UX rules below — not the visitor-specific fields themselves.

---

## Reference implementation

| Area | Location |
|------|----------|
| List page wiring | `idreesia-web/imports/ui/modules/security/visitor-registeration/list/list.tsx` |
| Shared list table | `idreesia-web/imports/ui/modules/common/visitors/list.tsx` |
| Shared list filter + chips | `idreesia-web/imports/ui/modules/common/visitors/list-filter.tsx` |
| Edit shell (tabs, breadcrumbs, loading) | `idreesia-web/imports/ui/modules/security/visitor-registeration/edit/edit-form.tsx` |
| Shared edit form layout | `idreesia-web/imports/ui/modules/common/visitors/general-info.tsx` |
| Shared new form (wraps edit layout) | `idreesia-web/imports/ui/modules/common/visitors/new-form.tsx` |
| Security new visitor page | `idreesia-web/imports/ui/modules/security/visitor-registeration/new/new-form.tsx` |
| Picture side panel | `idreesia-web/imports/ui/modules/security/visitor-registeration/edit/picture.tsx` |
| Audit footer | `idreesia-web/imports/ui/modules/common/audit-info/audit-info.tsx` |
| Shared list / audit CSS | `idreesia-web/client/main.css` (`.list-*`, `.audit-info`) |
| Feature-specific CSS | `idreesia-web/client/security-visitors-list.css` |
| CSS entry | `idreesia-web/client/main.tsx` |

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
      {/* Optional: settings / download menu */}
    </Space>
    <FilterChips {...filterProps} />
  </div>
</div>
```

**Shared classes** (in `main.css`):

- `list-table-header` — full-width row, space-between
- `list-table-header-section` — left action cluster
- `list-table-header-utilities` — right column, end-aligned, chips underneath

### 2. Filter UX

- Prefer **Popover** over Collapse / always-visible filter forms
- Trigger: **Filter** button with `FilterOutlined`
- Wrap in `Badge` with `count={activeFilterCount}`
- Place **Refresh** (`SyncOutlined`) beside Filter
- Popover: `trigger="click"`, `placement="bottomRight"`
- On open, sync form fields from current query params
- Override global `form { width: 600px }` inside the popover with `list-filter-panel` (640px)
- Keep a single primary **Search** submit; do **not** add Reset when chips provide **Clear all**
- Gate optional filter fields with props (enable only what that list needs)

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

**Shared table palette** (`.list-table` in `main.css`):

- Outer / header / footer edge: `#d0d5dd`
- Inner column & row lines: `#cfd4dc`
- Header fill: `#f3f4f6`, text `#344054`
- Row hover: `#f5f9ff`
- Selection column locked to 48px when using `scroll.y`

**Page-specific row tinting** (optional): keep in a dedicated `client/<module>-*.css` file (e.g. warning/alert row backgrounds). Do not put entity-specific tints in shared `.list-table` rules.

### 5. List checklist

1. Toolbar with `list-table-header` + utilities
2. Filter Popover + badge + refresh; chips + Clear all; no form Reset
3. `list-container` / `list-table`; middle, bordered, footer pagination
4. Shared CSS only in `main.css`; page-specific rules in `client/*.css` imported from `main.tsx`
5. Smoke-test apply/clear filters, vertical scroll, selection column width

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
- Upload button label: short (**Upload**), not “Upload Picture”
- Empty state when no image (no broken `img`)

### 4. Notes / risk signals (when applicable)

- Prefer a Notes **section on the main form**, not a separate tab
- Badge on the section header when notes/risk fields have content (error stronger than warning)
- Short `Alert` banners above the fields when content exists
- Save notes with the main form save (one Save for the tab)

### 5. Form actions & audit footer

- Single **Save** / **Cancel** under the sections (`FormButtonsSaveCancel` with `fullWidth` so buttons sit flush-right under full-width section cards)
- Disable Save until fields are touched; clear touched state after successful save
- **AuditInfo** below the form, inside the **same width wrapper** as the form (not full page width)
- Audit styling (`.audit-info` in `main.css`): quiet metadata — light `#f9fafb` fill, `#d0d5dd` border, 8px radius, small uppercase labels + name · date

### 6. Nested / related lists on edit

When an edit tab embeds a list (e.g. Stay History), apply the same **Part A** list chrome (`list-container`, `list-table`, `list-table-header`, `size="middle"`).

### 7. New forms

Reuse the same sectioned layout as edit (prefer wrapping the shared general-info form):

- Same collapse sections and `fullWidth` Save/Cancel alignment
- Defaults as needed (e.g. Country = Pakistan for new visitors)
- Omit notes / picture / audit until after create when those belong on edit
- Cancel → list; on successful create, toast then navigate to the edit page
- Show `Spin` while lookup data (cities/countries) loads — not a blank page

### 8. Edit / new checklist

1. Dynamic breadcrumbs (entity name on edit; “New” on create)
2. Spin / Empty instead of blank render
3. Collapse sections with shared header chrome; `forceRender` on panels
4. Optional picture side panel (non-collapsible, no title bar) beside Personal Information
5. Consolidate notes onto main tab when possible; badge + alerts for risk
6. Edit: stay-on-save + toast; Cancel → list. New: toast + navigate to edit after create
7. Semantic URL tab keys if multiple tabs remain
8. Form + AuditInfo share one max-width wrapper (hide audit on new if not applicable)
9. Page-specific CSS in `client/<feature>.css`; import from `main.tsx`

---

## CSS organization

### Shared (`client/main.css`)

| Class | Role |
|-------|------|
| `list-table-header` / `list-table-header-utilities` | List toolbar |
| `list-filter-chips` / `list-filter-panel` | Filter chips + popover width |
| `list-container` / `list-table` | Table chrome |
| `audit-info` / `audit-info-line` / `audit-info-label` | Edit form audit footer |

### Feature-specific (`client/<module>-<feature>.css`)

Only rules unique to that feature (row tints, form side panel, collapse skin for that module until/unless promoted to shared).

Import from `client/main.tsx` next to other feature styles.

### Meteor CSS loading (important)

**Do not** `import './foo.css'` from files under `imports/ui/...`.

Meteor can treat that import as a module value and break component exports (blank page; “type is invalid… got: object”).

Always load CSS from `client/main.tsx` (or another client entry).

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
- Keep the parent group in `openKeys` when a child is active; still allow manual expand/collapse
- Sync `activeSubModuleName` from the URL so refresh / deep links keep the sidebar highlight
- Nested routes (edit/new/upload) should highlight the parent list item, not a blank selection

Reference: `idreesia-web/imports/ui/modules/security/sidebar.tsx`

---

## Out of scope / avoid

- Dumping page-only rules into `main.css` when they will not be reused
- Colocating CSS imports next to React components under `imports/ui`
- Sticky table columns unless selection/scroll behavior is re-verified
- Duplicate Reset + Clear all for the same filter state
- Numeric tab keys that fight legacy URL remapping
- Full-bleed audit/footer blocks wider than the form cards
- Purple/glow/dashboard clutter — stay aligned with Ant Design + shared chrome above
