import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';
import { describe, expect, it } from 'vitest';
import { parse } from 'graphql';

// Logged-in access is the default: a Query or Mutation field with no
// directive (and no resolver check) is open to every logged-in user. This
// test makes that a conscious choice. A new field must carry a directive, or
// be added below with the reason it is open.
//
// It checks that a field declares protection, not that the permission chosen
// is right. REST routes are not covered.

const PROTECTION_DIRECTIVES = [
  'checkPermissions',
  'checkInstanceAccess',
  'checkCommitteeAccess',
  'checkDutiesAttendanceAccess',
  'checkMehfilDetailsAccess',
  'checkMehfilPermissionsAccess',
  'superAdminOnly',
];

const ALLOWED: Record<string, string> = {
  // Open by design: lookups and sign-in.
  'Query.currentUser': 'returns the caller, or null before sign-in',
  'Mutation.registerUser': 'sign-up, before there is a user',
  'Query.allPeopleTags': 'open lookup',
  'Query.userNames': 'open lookup',
  'Query.distinctCities': 'open lookup',
  'Query.distinctCountries': 'open lookup',
  'Query.distinctRegions': 'open lookup',
  'Query.allCities': 'open lookup',
  'Query.pagedCities': 'open lookup',
  'Query.cityById': 'open lookup',
  'Query.allCityMehfils': 'open lookup',
  'Query.cityMehfilsByCityId': 'open lookup',
  'Query.allAccessiblePhysicalStores': 'already limited to the caller stores',

  // Caller-scoped: act only on the caller's own data.
  'Mutation.startTwoFactorSetup': "caller's own account",
  'Mutation.enableTwoFactor': "caller's own account",
  'Mutation.disableTwoFactor': "caller's own account",
  'Mutation.updateLoginTime': "caller's own account",
  'Mutation.updateLastActiveTime': "caller's own account",
  'Query.myCommittees': "caller's own committees",
  'Query.myCommitteeLocations': "locations of the caller's own committees",
  'Query.myDutiesAttendanceLocations':
    "locations of the caller's own Duties and Attendance workspaces",
  'Query.myMehfilPermissionsLocations':
    "mehfils whose permissions the caller can open",
  'Query.myMehfilDetailsLocations':
    "mehfils whose details the caller can update",
  'Query.myNotifications': "caller's own notifications",
  'Query.myNotificationCounts': "caller's own notifications",
  'Mutation.markNotificationsRead': "caller's own notifications",

  // Checked in the resolver.
  'Mutation.updateAttachment':
    'category permission and store access, in common/attachment/access.ts',
};

const root = join(__dirname);

const sdlBlocks = globSync(join(root, '**/*.ts').replace(/\\/g, '/'), {
  ignore: ['**/node_modules/**', '**/generated/**', '**/*.test.ts'],
})
  .sort()
  .flatMap(file =>
    [...readFileSync(file, 'utf8').matchAll(/gql`([\s\S]*?)`/g)].map(
      match => match[1].trim()
    )
  );

const document = parse(
  ['type Query', 'type Mutation', ...sdlBlocks].join('\n\n')
);

const unprotected = new Set<string>();
const all = new Set<string>();

for (const definition of document.definitions) {
  if (
    definition.kind !== 'ObjectTypeDefinition' &&
    definition.kind !== 'ObjectTypeExtension'
  ) {
    continue;
  }
  const rootName = definition.name.value;
  if (!['Query', 'Mutation', 'Subscription'].includes(rootName)) continue;

  for (const field of definition.fields ?? []) {
    const key = `${rootName}.${field.name.value}`;
    all.add(key);
    const protectedField = (field.directives ?? []).some(directive =>
      PROTECTION_DIRECTIVES.includes(directive.name.value)
    );
    if (!protectedField) unprotected.add(key);
  }
}

describe('unprotected Query and Mutation fields', () => {
  it('reads the schema', () => {
    expect(all.size).toBeGreaterThan(300);
  });

  it('has none outside the allowlist', () => {
    const unlisted = [...unprotected].filter(key => !(key in ALLOWED)).sort();
    expect(
      unlisted,
      `These fields have no directive. Add @checkPermissions, @checkInstanceAccess, @checkCommitteeAccess or @superAdminOnly, or add the field to ALLOWED with the reason it is open: ${unlisted.join(', ')}`
    ).toEqual([]);
  });

  it('has no stale allowlist entry', () => {
    const stale = Object.keys(ALLOWED)
      .filter(key => !unprotected.has(key))
      .sort();
    expect(
      stale,
      `These ALLOWED entries no longer exist or now have a directive. Remove them: ${stale.join(', ')}`
    ).toEqual([]);
  });
});
