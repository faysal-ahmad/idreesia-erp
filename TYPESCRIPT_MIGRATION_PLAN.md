# TypeScript Migration Fix Plan

Branch: `feature/switch-to-typescript` — converting `idreesia-web` from JS/JSX to TS/TSX and removing blanket `@ts-nocheck`.

This file tracks recurring bug patterns and fixes found while cleaning up modules after the conversion, using `idreesia-web/imports/ui/modules/hr/karkuns/edit` as the reference use-case. Use it as a checklist/playbook when fixing the next module, and keep it updated as we go (add new patterns, tick off completed use-cases, log anything discovered but not yet fixed).

## Bug patterns & fixes

### 1. Circular-import "const alias" snapshot bug — causes `Element type is invalid: ... undefined`

- **Root cause:** Meteor's module system (`reify`) compiles named imports into live bindings via `module.link(...)` setter callbacks. In a circular import chain, a setter can fire *after* the importing module's own top-level code has already run. The pre-TS `.jsx` code always referenced imported components directly inside JSX at render time (safe — rendering happens long after all modules finish loading). The TS conversion instead added lines like:

  ```ts
  const AuditInfoComponent = AuditInfo as any;
  ```

  at module top level. If this line runs before the circular setter fires, it permanently captures `undefined` into `AuditInfoComponent`, even though the live `AuditInfo` binding gets updated correctly later. At render time this shows up as React's "Element type is invalid ... but got: undefined" error, with the owner reported as whichever component's render created the JSX.
- **Confirmed broken (now fixed — root cause, not just symptom):** `idreesia-web/imports/ui/modules/common/karkuns/general-info.tsx` — `AuditInfoComponent` was undefined because this file imports `AuditInfo` from the barrel `/imports/ui/modules/common`, which itself re-exports `KarkunsGeneralInfo` from this very file (`common/index.ts` → `karkuns/general-info.tsx` → `common/index.ts`). **This was the original bug report.**
- **First fix attempt (symptom-level, superseded):** moved `const AuditInfoComponent = AuditInfo as any;` from module top-level into the component's function body, so it evaluates at render time instead of module-load time. This does resolve the timing race (verified against the compiled bundle), but it leaves the actual circular import between `common/index.ts` and the file in place — it makes the code *resilient to* the cycle rather than removing it. Correctly called out as insufficient.
- **Actual fix (root cause):** import `AuditInfo` directly from its source file instead of through the barrel — `import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';` instead of `import { AuditInfo } from '/imports/ui/modules/common';`. This removes the circular edge entirely; the alias can go back to being a normal module-top-level `const` (no special render-time placement needed) since there's no cycle left to race against. Confirmed via `grep -rl "from '/imports/ui/modules/common'" idreesia-web/imports/ui/modules/common` returning empty after the fix — no file under `common/` imports back from its own barrel anymore. Also confirmed against the compiled Meteor dev-bundle: the `module.link(...)` call now points straight at `/imports/ui/modules/common/audit-info/audit-info`, never at the barrel.
- **Fixed in all 3 files** that had this shape (found via `grep -rl "from '/imports/ui/modules/common'" idreesia-web/imports/ui/modules/common`, i.e. files both exported by the barrel and importing from it):
  - `common/karkuns/general-info.tsx` (the one actually crashing)
  - `common/visitors/general-info.tsx`
  - `common/karkuns/wazaif-and-raabta.tsx`
- **Lesson:** when a circular-import timing bug shows up, prefer breaking the cycle at its source (import from the concrete file, not the barrel) over making the code merely resilient to the race — the latter can look like a fix (tests pass, error goes away) while leaving the actual structural problem in place for the next person to trip over.
- **Still worth doing:** a repo-wide grep for the same shape (barrel-exported file importing back from its own barrel) in case other circular pairs exist outside `common/karkuns`/`common/visitors` — none currently known.

### 2. Why `const Foo = Bar as any;` aliases exist at all

- **Syntactic reason:** JSX doesn't allow an inline type assertion in the tag position (`<Bar as any .../>` is invalid). The cast has to happen in a separate statement first, then the resulting variable is used as the tag.
- **Practical reason:** many shared components (form fields, `AuditInfo`, `KarkunsGeneralInfo`, etc.) don't have prop types precise enough to match how they're invoked across call sites. Rather than writing correct prop interfaces during the mechanical `@ts-nocheck` removal pass, the conversion cast each import to `any` at the call site to suppress prop-type checking.
- This pattern is pervasive and mostly harmless — it only actually breaks when the underlying import is reachable through a circular chain (see #1).
- **When the cast is no longer needed:** delete the alias entirely and use the imported name directly (`<Divider />`, not `const AntDivider = Divider;` / `<AntDivider />`). Identity aliases left behind after dropping `as any` are pure noise — do not keep them. Legitimate non-identity aliases are fine to keep (e.g. `const TabPane = Tabs.TabPane;`, or `import { AttachmentsList as AttachmentsListControl }` to avoid a local name clash).

### 3. `useQuery`/`useMutation` document `as any` casts — root cause found & fixed globally

- **Root cause:** two different copies of the `graphql` npm package were installed:
  - Root `package.json` pinned `graphql: 16.14.2` (exact).
  - `idreesia-web/package.json` declared `graphql: ^16.6.0`, and `idreesia-web`'s own separate `yarn.lock` (it has no `workspaces` relationship with the root — it's a Meteor app with its own independently-managed `node_modules`) had locked that to exactly `16.6.0`.
  - `graphql-tag` (used for every `gql\`...\`` query constant) is installed in both places; the copy in `idreesia-web/node_modules/graphql-tag` resolves its `graphql` peer to `idreesia-web/node_modules/graphql@16.6.0`.
  - `@apollo/client` is only installed at the repo root; its `graphql` peer resolves to the root's `graphql@16.14.2`.
  - Result: TypeScript sees two structurally different `DocumentNode`/`Kind` enum shapes for "the same" package, so passing a query constant straight into `useQuery`/`useMutation` fails with "No overload matches this call" — hence the `as any` cast on every query/mutation document argument.
- **Fix applied:** bumped `idreesia-web/package.json`'s `graphql` to `^16.14.2` and ran `yarn install` inside `idreesia-web` so its lockfile/`node_modules` resolve to `16.14.2`, matching the root. Verified via `tsc --noEmit` that the cast is no longer needed.
- **Status:** the dependency fix is global (benefits the whole codebase), but the `as any` casts themselves still need to be removed file-by-file. **Only done so far in `hr/karkuns/edit`** — sweep the rest of the codebase separately.

### 4. Composer HOCs → hooks migration

Prefer hooks over `flowRight(...)`-composed HOCs when a hook equivalent exists.

| Former composer (`idreesia-common/composers/*`) | Hook (`idreesia-common/hooks/*`) | Status |
| --- | --- | --- |
| `WithAllCities` | `useAllCities` | done |
| `WithAllCityMehfils` | `useAllCityMehfils` | done |
| `WithQueryParams` | `useQueryParams` | done (hook takes `{history, location, paramNames, paramDefaultValues}` → `{queryString, queryParams, setPageParams}`) |
| `WithBreadcrumbs` | `useBreadcrumbs` | done |
| `WithDynamicBreadcrumbs` | `useDynamicBreadcrumbs` | done (pass `unknown[]`, not a comma-separated string) |
| `WithActiveModule` | `useActiveModule` | done |
| `WithLoggedInUser` | `useLoggedInUser` | done |
| `WithAllPhysicalStores` | `useAllPhysicalStores` (`hooks/admin`) | done |
| `WithDistinctCities` / `Countries` / `StayAllowedBy` | `useDistinct*` (`hooks/security`) | done |

**`idreesia-common/composers` removed** — every former HOC had a hook counterpart and zero remaining call sites after the hr/inventory/security/admin sweeps.

**Migration pattern:**

1. Remove the `flowRight(...)`-wrapped `export default`; export the component directly.
2. Call the hook(s) directly inside the component body instead of receiving injected props.
3. Check whether any composer-injected prop (e.g. `queryParams`) was being forwarded via `{...props}` to child components — if nothing downstream reads it, it's safe to drop; otherwise thread it through explicitly.
4. Verify with `tsc --noEmit`.

### 5. PropTypes removal

Once a component's params are typed via a TS `interface`/type, delete the `import PropTypes from 'prop-types';` import and the trailing `Component.propTypes = {...}` block — the interface is the source of truth. Don't add prop types for props that aren't actually destructured/used (check before assuming a `location: PropTypes.object` etc. is needed).

### 6. Stop hand-rolling `MatchLike`/`HistoryLike`/`LocationLike` — use react-router's real types

Components rendered via react-router v5's `<Route component={...}>` (confirmed: every `*EditForm` is wired up this way in each module's `router.tsx`) receive `match`/`location`/`history` shaped by react-router itself, not by us. The TS conversion invented local per-file interfaces for these instead of importing the real types, which duplicates the shape (often incompletely/incorrectly) across dozens of files.

The real types already exist as devDependencies (declared at the repo root, `@types/react-router` + `@types/react-router-dom` + `@types/history`) and are used via imports from `'react-router'` / `'history'`:

- `RouteComponentProps<Params>` (from `'react-router'`) — `{ history: History; location: Location; match: match<Params>; staticContext?: ...}`. Use this when a component needs all three (e.g. the top-level `*EditForm` that a `<Route>` renders directly).
- `match<Params>` (from `'react-router'`) — `{ params: Params; isExact: boolean; path: string; url: string; }`. Use this (as `match<{ karkunId: string }>` etc., with the actual route param names) when a component only needs `match`.
- `History` (from `'history'`, react-router v5's own history dependency) — has `push(...)`, `goBack()`, etc. Use this when a component only needs `history`.

**Fix pattern:**

```ts
// before
interface MatchLike { params: { karkunId: string; }; }
interface HistoryLike { goBack(): void; }
interface Props { match: MatchLike; history: HistoryLike; karkunId?: string | null; }

// after
import { type match } from 'react-router';
import { type History } from 'history';
interface Props { match: match<{ karkunId: string }>; history: History; karkunId?: string | null; }
```

For a component that receives the full route-props object directly (i.e. is rendered by `<Route component={...}>`), just use `type Props = RouteComponentProps<{ karkunId: string }>` instead of destructuring three separate hand-rolled interfaces.

### 7. Stop spreading `{...props}` — pass required props explicitly

Spreading a loosely-typed `props` object (e.g. `Record<string, any>`) onto JSX doesn't satisfy a child component's specific required props in TypeScript's eyes, even though the values are present at runtime — an index-signature type doesn't statically guarantee named properties exist, so TS reports errors like:

```text
error TS2739: Type '{ karkunId: any; }' is missing the following properties from type 'Props': history, match
```

Fix: destructure what the parent actually has (`match`, `location`, `history`, etc.) and pass each child exactly the named props its own `Props` interface declares — no more, no less. This also lets each child's `as any` component alias be dropped, since you're no longer relying on an untyped spread to smuggle props past the type checker; the component can be used directly (e.g. `<GeneralInfo .../>` instead of `<GeneralInfoForm = GeneralInfo as any>`).

### 8. Watch for stray TypeScript version hoisting after any `yarn install` inside `idreesia-web`

`idreesia-web` has no `workspaces` relationship with the root — it's a Meteor app with its own independent `node_modules`/`yarn.lock`. The root pins `typescript: 6.0.3` (supports `moduleResolution: "Bundler"`, required by `idreesia-web/tsconfig.json`), but `idreesia-web` doesn't declare `typescript` itself — `meteor-babel` (a devDependency) transitively wants `typescript@^4.2.2`. Depending on exactly what triggers a reinstall, yarn can hoist that transitive `4.9.5` into `idreesia-web/node_modules/.bin/tsc`, shadowing the root's `6.0.3` for any `tsc` invocation run from inside `idreesia-web` — `tsc` then fails outright with config errors (`moduleResolution` value not recognized) rather than giving real diagnostics.

- **Fix applied:** added `"typescript": "6.0.3"` to `idreesia-web/package.json`'s existing `resolutions` block (same pattern already used there for other packages) and reinstalled. Yarn warns that this is "incompatible with requested version `^4.2.2`" — expected, and fine to ignore (a `resolutions` override is explicitly for forcing a version yarn wouldn't otherwise reach).
- **When verifying any fix with `tsc --noEmit`:** if you get generic config errors instead of file diagnostics, check `npx tsc --version` from inside `idreesia-web` — it should report `6.0.3`. If it doesn't, this hoisting has recurred and needs the same `resolutions` treatment (or re-adding it if it was ever removed).

### 9. Type `useQuery`/`useMutation` data via `TypedDocumentNode` on the query constant, not generics at the call site

The codebase already has GraphQL Code Generator set up (`codegen.ts` at the repo root, schema + operations scanned from `idreesia-web`/`idreesia-mobile` `.ts`/`.tsx` files) generating precise types into `idreesia-common/types/graphql.ts` (schema types), `idreesia-common/types/client-operations.ts` (one `<OperationName>Query`/`<OperationName>QueryVariables` pair per operation, named from the operation name in the `gql` tag — e.g. `query hrKarkunByIdForKarkuns(...)` → `HrKarkunByIdForKarkunsQuery`/`HrKarkunByIdForKarkunsQueryVariables`), and `idreesia-common/types/resolvers.ts` (resolver types, split out so the Meteor package doesn't pull value imports from `graphql` into schema/ops files). Most call sites ignore this entirely and either cast the query `as any` (pattern #3) or hand-roll a loose `QueryData { hrKarkunById?: AnyRecord | null }` interface and cast `data` to it.

Apollo Client 4's `useQuery` overloads are written expecting a `TypedDocumentNode<TData, TVariables>` on the document itself — passing explicit generics to `useQuery<TData, TVariables>(...)` still works but is flagged as a deprecated overload (`tsc` emits a hint, not an error). The idiomatic fix is to type the query constant once, at its definition, and let every consumer infer for free:

```ts
// idreesia-web/imports/ui/modules/hr/karkuns/gql/hr-karkun-by-id.ts
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrKarkunByIdForKarkunsQuery,
  HrKarkunByIdForKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_KARKUN_BY_ID: TypedDocumentNode<
  HrKarkunByIdForKarkunsQuery,
  HrKarkunByIdForKarkunsQueryVariables
> = gql`
  query hrKarkunByIdForKarkuns($_id: String!) { ... }
`;
```

Then every consumer just does `useQuery(HR_KARKUN_BY_ID, { variables: { _id } })` — no generics, no `as any`, no local `QueryData` cast — and `data` is the real generated shape.

**Where this hits hard:** typing the query for real makes its `QueryVariables` strict (e.g. `_id: string`, not `string | undefined`). Any consumer that was passing a possibly-`undefined`/`null` value straight through (because the untyped query never checked) becomes a genuine compile error — this is a feature, not a regression: it caught a real bug in `wazaif-and-raabta.tsx`, which was passing an optional `karkunId` straight into `_id` (see pattern #10 — the actual fix there was to make `karkunId` correctly required, not to paper over it with `?? ''`).

**Status:** done for **all** of `ui/modules/{hr,inventory,security,admin}/**/gql/` (plus extracted visitor-stays/setup/physical-stores/user-groups gql folders and related common hooks), HR/security/admin lookup hooks, and inline gql cleaned under those modules. Still needed outside cleaned modules — apply the same `TypedDocumentNode` + `meteor/idreesia-common/types/client-operations` pattern when touching the next module (see also pattern #13).

### 10. Keep prop optionality honest — don't default a required value to `null`/`""` to dodge a type error

`edit-form.tsx` computed `karkunId` via `get(match, 'params.karkunId', null)` (lodash `get` with a `null` fallback), which made every child component's `karkunId` prop `string | null` even though the route can never render this tree without a `:karkunId` segment — `match.params.karkunId` is always a real `string` once `match` is typed as `match<{ karkunId: string }>` (pattern #6). The `null`-optional prop then quietly leaked into query variables that actually require a non-nullable `string` (pattern #9 is what surfaced it as a real error rather than a silent runtime possibility).

**Fix:** access the guaranteed value directly — `const karkunId = match.params.karkunId;` — instead of routing it through a nullable-default helper, and type every downstream `Props.karkunId` as `karkunId: string` (not `karkunId?: string | null`). When a later error suggests "just add `?? ''`" or `?? null`, stop and check whether the value was ever actually allowed to be missing — if the route guarantees it, fix the type to say so instead of coalescing around it.

### 11. `as any` on antd/component aliases — root cause was a duplicate `@types/react`, same disease as pattern #3

Almost every file aliases its imported components before use — not just custom form fields (pattern #2's "loose prop types" story) but plain antd components too: `const AntForm = Form as any;`, `const AntDivider = Divider as any;`, etc. antd ships accurate first-party types, so this seemed suspicious — antd components shouldn't need a cast at all.

**Root cause, confirmed empirically:** exactly the same disease as pattern #3 (`graphql`), but for `@types/react`:

- Root: `@types/react@17.0.93` (pinned via `"@types/react": "17"`), matching the `react@17.0.2` runtime both projects use.
- `idreesia-web`'s own `node_modules/@types/react`: **18.0.26** — a completely different major version, even though `idreesia-web` declares and runs `react@^17.0.2`. Traced with `yarn why @types/react` inside `idreesia-web`: pulled in transitively via `react-redux` → `@types/hoist-non-react-statics` → `@types/react`, and hoisted to `idreesia-web/node_modules/@types/react` — unrelated to what React version the app actually declares or runs. This is the exact same shape as pattern #8 (`meteor-babel` hoisting a stray `typescript@4.9.5`), just hitting `@types/react` instead, with far bigger blast radius since it affects the JSX return type of every component in the app.
- Symptom when you drop the `as any` cast: `'AntForm' cannot be used as a JSX component. ... Types of property 'key' are incompatible. Type 'Key | null' is not assignable to type 'string | null'. Type 'number' is not assignable to type 'string'.` — this exact "`Key | null` vs `string | null`" shape is the textbook signature of two different `@types/react` versions being active at once; recognize it on sight.

**Fix applied:** added `"@types/react": "17.0.93"` to `idreesia-web/package.json`'s `resolutions` block (same mechanism as pattern #8's `typescript` pin) and reinstalled. Verified: `idreesia-web/node_modules/@types/react` is now `17.0.93`, and the `Key`-incompatibility error is gone when the cast is removed.

**Practical consequence:** most of the `as any` aliasing on antd (and likely other properly-typed React library) components across the whole codebase was never about loose prop types at all — it was compensating for this dependency bug. After the fix, drop the whole alias and use the import directly (see pattern #2) — if `tsc --noEmit` stays clean, it was this bug; if a *different*, specific error shows up (a real prop-shape mismatch, a `null`-vs-required mismatch, etc.), that's a genuine issue worth its own narrow fix (pattern #2 still applies for actual custom-field-component looseness, but prefer fixing the prop types over re-adding an `as any` alias).

**Status:** dependency fix is in (global, benefits the whole codebase like pattern #3 did). Alias sweep is **done** for `ui/modules/common` and `hr/karkuns/edit`; still needed everywhere else. When sweeping: delete the alias entirely and use the import directly (don't leave `const AntX = X`).

### 12. Style-object `as any` — type as `CSSProperties`

Plain style consts (`const ContainerStyle = { width: '500px' }`) often needed `style={ContainerStyle as any}` because TypeScript infers a narrow object type that isn't assignable to `React.CSSProperties` / antd's style prop. Fix: `const ContainerStyle: CSSProperties = { ... }` and drop the cast. Same for color/flex layout style objects on icons and spans.

### 13. Replace `AnyRecord` / hand-rolled `QueryData` with real types

`type AnyRecord = Record<string, any>` (and local `interface QueryData { ... AnyRecord }`) was pasted everywhere during the mechanical TS conversion. It is not one problem — pick the right replacement by boundary:

1. **GraphQL query/mutation results & table rows** — type the document as `TypedDocumentNode` (pattern #9), then derive the row:
   ```ts
   type KarkunDuty = NonNullable<
     NonNullable<KarkunDutiesByKarkunIdQuery['karkunDutiesByKarkunId']>[number]
   >;
   ```
   Prefer **operation** types from `meteor/idreesia-common/types/client-operations` over full schema types in `graphql.ts` (selection-set accurate). Filter nullable GraphQL list items before handing them to antd: `(data?.items ?? []).filter((row): row is Row => row != null)`.
2. **Hook-fed lookup lists** (`allJobs`, duties, cities, …) — type the hook's own `gql` doc the same way so it stops returning `unknown[]`. Drop `(raw ?? []) as AnyRecord[]`. Cascader helpers (`getCityMehfilCascaderData`, `getDutyShiftCascaderData`) already accept `{ _id?, name?, cityId?/dutyId? }` with nullables — pass the typed arrays through with no cast.
3. **Form `onFinish` / `handleFinish` values** — do **not** reuse GraphQL entity types (forms use `Dayjs`, cascader tuples like `cityIdMehfilId: [cityId, mehfilId]`, etc.). Export an explicit `FormValues` interface from the form component (see `common/karkuns/general-info.tsx` → `KarkunGeneralInfoFormValues`, `common/visitors/general-info.tsx` → `VisitorGeneralInfoFormValues`). Consumers type `handleFinish(values: ThatFormValues)`. When mutation variables expect `string` but the form has `Dayjs`, cast at the mutation boundary only (`as unknown as string`) rather than widening `FormValues` back to `any`.
4. **Shared/reusable list components** (under `ui/modules/common`) used by multiple modules with different selection sets — a focused local row interface covering only the fields the list actually renders is fine when no single operation type fits. When one does fit (e.g. `HelperPagedHrKarkunsQuery`, `PagedPeopleQuery`), derive from it.
5. **`SelectField` callbacks** — the field is generic (`SelectField<T>`). Pass `T` (or let it infer from `data`); do not type `getDataValue`/`getDataText` params as `AnyRecord`. For non-`_id`/`name` shapes (e.g. `{ label, value }`), use `SelectField<LabelValue>` with explicit getters.
6. **Filter forms / `setPageParams`** — replace `Props extends AnyRecord` and `setPageParams(params: AnyRecord)` with an explicit `PageParams` / `FilterFormValues` listing the known keys (including pagination). Export `PageParams` if parent modules need it.

**Do not** reintroduce `AnyRecord` to silence a type error — fix the upstream type (pattern #9 / #10) or add a narrow cast at the true mismatch.

**Status:** done for entire `ui/modules/{hr,inventory,security,admin}` and all of `ui/modules/common`. Apply when sweeping the next top-level module.

## Work log

### `hr/karkuns/edit` (reference use-case — done)

- [x] `general-info.tsx`: swapped `WithAllCities`/`WithAllCityMehfils` composers for `useAllCities`/`useAllCityMehfils` hooks; removed `flowRight`
- [x] `edit-form.tsx`: swapped `flowRight(WithQueryParams(), WithBreadcrumbs(...))` for `useQueryParams` + new `useBreadcrumbs` hook
- [x] `general-info.tsx`: removed `PropTypes` import/block, typed params via existing `Props` interface
- [x] Root-caused the `X as any` casts on gql documents to the duplicate `graphql` package versions (see pattern #3)
- [x] `idreesia-web/package.json`: `graphql` `^16.6.0` → `^16.14.2`; ran `yarn install`
- [x] Removed `as any` casts on all `useQuery`/`useMutation` document args across `hr/karkuns/edit/*.tsx`: `attendance-sheets.tsx`, `attachments-list.tsx`, `duty-participations.tsx`, `employment-info.tsx`, `profile-picture.tsx`, `wazaif-and-raabta.tsx`, `salary-sheets.tsx`, `general-info.tsx`
- [x] Found and fixed a stray TypeScript version hoisting issue in `idreesia-web` that was masking real `tsc` diagnostics (see pattern #8)
- [x] `edit-form.tsx`: converted every tab from `<XxxForm {...props} />` (using an `as any`-aliased component) to the real component with explicit named props matching its own `Props` interface (pattern #7) — `GeneralInfo`, `WazaifAndRaabta`, `ProfilePicture`, `DutyParticipation`, `AttendanceSheets`, `AttachmentsList`, `EmploymentInfo`, `SalarySheets`
- [x] `edit-form.tsx`: typed its own props via `RouteComponentProps<{ karkunId: string }>` instead of `Record<string, any>`; removed `PropTypes` import/block
- [x] Replaced hand-rolled `MatchLike`/`HistoryLike`/`LocationLike` with react-router's real `match`/`History`/`RouteComponentProps` types (pattern #6) in `edit-form.tsx`, `general-info.tsx`, `attachments-list.tsx`, `duty-participations.tsx`, `employment-info.tsx`, `profile-picture.tsx`, `wazaif-and-raabta.tsx`
- [x] `hr-karkun-by-id.ts`: typed `HR_KARKUN_BY_ID` as `TypedDocumentNode<HrKarkunByIdForKarkunsQuery, HrKarkunByIdForKarkunsQueryVariables>` (pattern #9); `general-info.tsx` and `wazaif-and-raabta.tsx` dropped their explicit `useQuery` generics / local `QueryData` casts accordingly
- [x] Fixed a real bug this surfaced: `wazaif-and-raabta.tsx` was passing an optional `karkunId` straight into the query's now-strict `_id: string` variable
- [x] Made `karkunId` required end-to-end (pattern #10): `edit-form.tsx` now derives it via direct `match.params.karkunId` access (no more lodash `get(..., null)`), and every tab's `Props.karkunId` is `string`, not `string | null`
- [x] **FIXED — original bug report:** circular-import undefined-component bug (pattern #1), properly this time. First pass (deferring the alias into the function body) only fixed the symptom; the actual fix imports `AuditInfo` directly from `/imports/ui/modules/common/audit-info/audit-info` instead of through the barrel, in all 3 affected files: `common/karkuns/general-info.tsx` (the one actually crashing), `common/visitors/general-info.tsx`, `common/karkuns/wazaif-and-raabta.tsx`. Confirmed no file under `common/` imports back from its own barrel anymore, and confirmed against the compiled Meteor dev-bundle that the module link now points at the concrete file, not the barrel.
- [x] Found and fixed a **second** stray-dependency-version bug (pattern #11, same shape as pattern #8 but for `@types/react`): `idreesia-web`'s own `node_modules/@types/react` had been hoisted to `18.0.26` (via `react-redux` → `@types/hoist-non-react-statics`) despite the app declaring/running `react@^17.0.2` — this is almost certainly the real reason `as any` got pasted onto antd/component aliases throughout the codebase, not loose prop types. Fixed by pinning `"@types/react": "17.0.93"` in `idreesia-web/package.json`'s `resolutions` (matching root) and reinstalling.
- [x] Removed `common/karkuns/general-info.tsx`'s `PropTypes`/`defaultProps` in favor of default parameter values (`cities = [], cityMehfils = [], showCityMehfilField = false, allowEhadInfoUpdation = false`), matching the treatment already given to `hr/karkuns/edit/general-info.tsx`; same for `common/visitors/general-info.tsx` and `common/karkuns/wazaif-and-raabta.tsx`.
- [x] **`as any` alias sweep (pattern #11), file-by-file status:**
  - `common/karkuns/general-info.tsx` — **clean.** All aliases needed zero casts once `@types/react` was fixed. Later (pattern #13) props moved off `AnyRecord` to operation/`FormValues` types and the cascader cast was dropped after the utility accepted nullable lookup shapes.
  - `common/visitors/general-info.tsx` — clean after fixing 3 *real* (non-dependency-bug) issues surfaced once casts were removed: `dataSource={distinctCities}`/`{distinctCountries}` needed `?? []` (hooks return `string[] | null`, field wants `string[] | undefined`), and `<AuditInfoComponent record={visitor} />` needed `record={visitor ?? {}}` (`visitor` is optional but `AuditInfo`'s `record` prop is required).
  - `common/karkuns/wazaif-and-raabta.tsx` — clean, zero remaining casts needed.
  - `hr/karkuns/edit/edit-form.tsx` — clean. `AntTabs`/`TabPane` needed no cast; found one unrelated real issue: `activeKey = queryParams['default-active-tab'] || '1'` needed `as string` (query-string values are typed `string | string[] | null`, `defaultActiveKey` wants `string | undefined` — this specific key is never array-valued in practice).
  - `hr/karkuns/edit/general-info.tsx` — clean. `KarkunsGeneralInfoForm` needed no cast; found one real issue: `karkun={data?.hrKarkunById}` needed `?? {}` (generated query type includes `null`/`undefined`, `KarkunsGeneralInfo`'s `karkun` prop is required).
  - `hr/karkuns/edit/attachments-list.tsx` — clean. `AttachmentsListControlComponent` needed no cast. Bonus: also dropped its redundant `QueryData`/`AnyRecord` cast on `HR_KARKUN_BY_ID`'s `data` (pattern #9 cleanup). One narrow, legitimate `as any` remains on the `attachments` prop — the generated GraphQL type marks list items/`_id` nullable per the schema, but the shared `AttachmentsListControl`'s `Attachment` interface requires non-null `_id`; a real schema-vs-hand-written-interface mismatch, not the dependency bug.
  - `hr/karkuns/edit/duty-participations.tsx` — **clean.** Later typed `KARKUN_DUTIES_BY_KARKUN_ID` + lookup hooks (patterns #9/#13); uses derived `KarkunDuty` row type, no `AnyRecord`/`QueryData`. PropTypes removed.
  - `hr/karkuns/edit/employment-info.tsx` — **clean.** Uses typed `HR_KARKUN_BY_ID` + `useAllJobs` / `SelectField<Job>`; no `AnyRecord`. PropTypes removed.
  - `hr/karkuns/edit/profile-picture.tsx` — **clean.** `Fragment`/`Row`/`Col`/`TakePicture`/`UploadAttachment` aliases needed no casts. Dropped local `QueryData` cast (`data?.hrKarkunById?.imageId`). PropTypes removed.
  - `hr/karkuns/edit/wazaif-and-raabta.tsx` — **clean.** `KarkunsWazaifAndRaabtaForm` needed no cast. Real issue: `karkun={data?.hrKarkunById ?? {}}` (same nullability fix as `general-info.tsx`). PropTypes removed.
  - `hr/karkuns/edit/attendance-sheets.tsx` / `salary-sheets.tsx` — **clean.** Typed paged queries (pattern #9); row types derived from generated ops (pattern #13). `columns as any` may remain (antd columns looseness). PropTypes removed.
  - `hr/karkuns/edit/duty-form.tsx` — **clean.** Typed `form?: FormInstance`; lookup props use generated duty/shift/location element types; cascader cast dropped (pattern #13). PropTypes removed.
- [x] PropTypes removed from every file under `hr/karkuns/edit/` (pattern #5) — `attachments-list.tsx`, `duty-participations.tsx`, `employment-info.tsx`, `profile-picture.tsx`, `wazaif-and-raabta.tsx`, `attendance-sheets.tsx`, `salary-sheets.tsx`, `duty-form.tsx` (plus the earlier `general-info.tsx` / `edit-form.tsx`)
- [x] Remaining `flowRight`/composer usages in `hr/karkuns/edit/*.tsx` — none left (only `general-info.tsx` and `edit-form.tsx` had composers; both already migrated)
- [x] `employment-info.tsx`, `profile-picture.tsx` dropped their redundant `QueryData`/`AnyRecord` cast on `HR_KARKUN_BY_ID`'s `data` (pattern #9 cleanup — same treatment as `attachments-list.tsx` / `general-info.tsx`)
- [x] Every query/mutation constant in `hr/karkuns/gql/` typed as `TypedDocumentNode` (pattern #9), importing from `meteor/idreesia-common/types/client-operations`
- [x] HR common lookup hooks (`useAllJobs`, `useAllMSDuties`, `useAllDutyShifts`, `useAllDutyLocations`) typed the same way
- [x] `SelectField` made generic; `AnyRecord` removed from all of `hr/karkuns/edit/`
- [x] `common/karkuns/{general-info,wazaif-and-raabta}` props use operation/`FormValues` types instead of `AnyRecord`

**Status of `hr/karkuns/edit` reference use-case:** done for the migration patterns in this plan, including zero `AnyRecord` under `hr/karkuns/edit/`. Generated types live at `idreesia-common/types/` (import via `meteor/idreesia-common/types/client-operations`).

### `ui/modules/common` (shared components — done)

Shared barrel at `idreesia-web/imports/ui/modules/common/` — cleaned end-to-end before continuing per-module edit screens, since almost every module imports from here.

- [x] No file under `common/` imports back from its own barrel (pattern #1 — already fixed earlier for `AuditInfo`)
- [x] PropTypes removed from every file under `common/` (pattern #5)
- [x] All `const X = Y as any` / identity aliases removed; use imports directly (patterns #2/#11)
- [x] `people/list-filter.tsx`: `WithDistinctCities()` HOC → `useDistinctCities()` hook (pattern #4)
- [x] `security-logs/list.tsx`: removed empty `flowRight()(...)` wrap
- [x] Style-object `as any` eliminated by typing consts as `CSSProperties` (see pattern #12)
- [x] `attendance/karkuns-attendance-list.tsx`: `(DatePicker as any).MonthPicker` → `<DatePicker picker="month" />` (antd 5)
- [x] Real issues fixed along the way: `rowSelection={null}` → `undefined` (antd typing); `PersonName` person objects needing `_id`; `form.setFields` array API in `visitors/new-form.tsx`; explicit `Props` interfaces replacing `Props extends Record<string, any>` on visitors/attendance lists

**`AnyRecord` under `common/` (pattern #13):** removed end-to-end. Lists/filters now use focused row interfaces or generated operation row types (`HelperPagedHrKarkunsQuery`, `PagedPeopleQuery`, `PagedHrAuditLogsQuery`, etc.); visitor forms export `FormValues` the same way as karkuns.

**Remaining narrow `as any` under `common/` (legitimate, leave until the underlying types improve):**
- `columns={... as any}` on antd `Table`s
- Occasional `PersonName` / security-log renderer boundary casts via `Parameters<typeof PersonName>` or renderer-specific record casts
- `SelectField` string-array city data in `people/list-filter.tsx` (string[] vs object records)

**Verified:** `cd idreesia-web && npx tsc --noEmit -p tsconfig.json` — zero errors under `modules/common/`; zero `AnyRecord` / `Record<string, any>` left in that tree.

### `ui/modules/hr` (entire module — done)

Applied patterns #1–#13 across all of `idreesia-web/imports/ui/modules/hr/` (not just edit screens).

- [x] All `*/gql/*.ts` docs typed as `TypedDocumentNode` (karkuns, people, salary-sheets, attendance-sheets, ms-duties, audit-logs) importing from `meteor/idreesia-common/types/client-operations`
- [x] Inline gql in `jobs/` and `duty-locations/` (and ms-duties list mutations) typed the same way
- [x] `hr/people/**` — edit/list/new/field/scan-card/print cleaned (mirrors karkuns; breadcrumbs `['HR', 'People', …]`; people-specific ops: `HrKarkunByIdForPeopleQuery`, `PagedAttendanceByHrPersonQuery`, `SetPeopleKarkunEmploymentInfoMutation`, `HrPeoplePagedHrKarkunsQuery`)
- [x] `hr/karkuns/**` beyond edit — list/new/field/scan-card/print cleaned
- [x] `hr/salary-sheets/**`, `hr/attendance-sheets/**` (list + print), `hr/ms-duties/**`, `hr/jobs/**`, `hr/duty-locations/**`, `hr/audit-logs/**`
- [x] `sidebar.tsx` → functional + `useActiveModule`; `router.tsx` keeps narrow `Switch`/`Route` `as any` aliases (react-router-dom JSX boundary)
- [x] `hr/common/hooks` — lookup hooks (`useAllJobs`, `useAllMSDuties`, `useAllDutyShifts`, `useAllDutyLocations`) extracted from former `hr/common/composers` (HOCs removed; all call sites import from hooks)
- [x] Zero `PropTypes`, `AnyRecord`, `Record<string, any>`, or `flowRight` + breadcrumb/query-params composers left under `modules/hr/`

**Legitimate remaining `as any` / loose typing under `hr/`:** `Link as RouterLink`, `ReactToPrint` / `Barcode` third-party, antd `columns as any`, attachment control vs nullable GraphQL lists, `useRef<any>` for print refs, `router` Switch/Route.

**Verified:** `cd idreesia-web && npx tsc --noEmit -p tsconfig.json` — **zero errors** project-wide after this sweep (including all of `modules/hr/`).

### `ui/modules/inventory` (entire module — done)

Applied patterns #1–#13 across all of `idreesia-web/imports/ui/modules/inventory/`.

- [x] All `*/gql/*.ts` docs typed as `TypedDocumentNode`; new gql folders extracted for stock-adjustments + `CREATE_PURCHASE_FORM` where inline ops lived
- [x] Inventory common hooks (`usePhysicalStore`, `usePhysicalStoreItemCategories`, `usePhysicalStoreLocations`, `usePhysicalStoreVendors`) typed as TypedDocumentNode
- [x] Created `useDynamicBreadcrumbs` and migrated all store-scoped screens off `WithDynamicBreadcrumbs`
- [x] stock-items, issuance-forms, purchase-forms, stock-adjustments, vendors, locations, item-categories, status-dashboard, issuance-report, purchasing-report, sidebar, common items-list/controls
- [x] `inventory/common/hooks` — lookup hooks (`usePhysicalStore`, `usePhysicalStoreItemCategories`, `usePhysicalStoreLocations`, `usePhysicalStoreVendors`); former `inventory/common/composers` HOC wrappers + `apollo-hooks` removed (all call sites already used hooks)
- [x] Zero `PropTypes`, `AnyRecord`, `flowRight` consumer usage left under `modules/inventory/`

**Legitimate remaining `as any` / loose typing:** `Link as RouterLink`, `router` Switch/Route, antd `columns: any[]`.

**Verified:** `cd idreesia-web && npx tsc --noEmit -p tsconfig.json` — **zero errors** project-wide (including all of `modules/inventory/`).

### `ui/modules/security` (entire module — done)

Applied patterns #1–#13 across all of `idreesia-web/imports/ui/modules/security/`.

- [x] All existing `*/gql/*.ts` docs typed as `TypedDocumentNode`; new gql folders extracted for `visitor-stays/` and `setup/{mehfil-duties,mehfil-langar-dishes,mehfil-langar-locations}/`
- [x] visitor-registeration, visitor-stays, visitor-stay-report, mehfils, mehfil-karkuns (+ print), mehfil-card-verification, karkun-verification, security-users, setup/*, audit-logs, sidebar, common composers/controls
- [x] `security/common/hooks` — `useMehfil`, `useMehfilIdParam`, `useAllSecurityMehfilDuties` (+ `SecurityMehfilDuty`), `useMehfilDuty`; former `security/common/composers` HOCs removed
- [x] Zero `PropTypes`, `AnyRecord`, `flowRight`, or breadcrumb/query-params composers left under `modules/security/`

**Legitimate remaining `as any` / loose typing:** `Link as RouterLink`, `Barcode`, `router` Switch/Route, antd `columns` looseness, occasional ReactToPrint refs.

**Verified:** `cd idreesia-web && npx tsc --noEmit -p tsconfig.json` — **zero errors** project-wide (including all of `modules/security/`).

### `ui/modules/admin` (entire module — done)

Applied patterns #1–#13 across all of `idreesia-web/imports/ui/modules/admin/`.

- [x] All existing `*/gql/*.ts` docs typed as `TypedDocumentNode`; new gql folders for `physical-stores/` and remaining `user-groups/` ops; `distinctRegions` typed in cities list
- [x] Created `useAllPhysicalStores` (`idreesia-common/hooks/admin`) replacing `WithAllPhysicalStores` at call sites
- [x] cities, physical-stores, users, user-groups, sidebar cleaned (composers → `useBreadcrumbs` / `useQueryParams` / `useAllCities` / `useAllPhysicalStores` / `useActiveModule`)
- [x] Zero `PropTypes`, `AnyRecord`, `flowRight`, or breadcrumb/query-params composers left under `modules/admin/`

**Legitimate remaining `as any` / loose typing:** `Link as RouterLink`, `router` Switch/Route, antd `columns` looseness.

**Verified:** `cd idreesia-web && npx tsc --noEmit -p tsconfig.json` — **zero errors** project-wide (including all of `modules/admin/`).

### Other use-cases (not started)

Apply the same treatment (patterns #1–#13) when we get to these:

- Remaining cleanup outside cleaned modules: `PropTypes` / `as any` gql casts in helpers or other packages if any remain

**RESUME POINT:** `ui/modules/{common,hr,inventory,security,admin}` done; `idreesia-common/composers` removed in favor of `idreesia-common/hooks`.

### Codebase-wide follow-ups

- [ ] Sweep for other `X as any` casts on `useQuery`/`useMutation` document arguments outside cleaned modules now that the `graphql` dedupe fix applies repo-wide
- [x] Create a `useDynamicBreadcrumbs` hook (mirroring `useBreadcrumbs`) — done; reused in inventory + security
- [x] Create `useAllPhysicalStores` hook — done for admin
- [x] Remove `idreesia-common/composers` after all call sites migrated to hooks

## How to verify a fix

- `cd idreesia-web && npx tsc --noEmit -p tsconfig.json | grep -i "<path-being-worked-on>"` — confirm no new errors, ideally zero output for the target path
- Manually smoke-test the affected page in the running Meteor app for UI-facing changes (composer→hook swaps, prop-forwarding changes)
