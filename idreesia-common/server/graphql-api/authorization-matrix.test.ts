import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'glob';
import { describe, expect, it } from 'vitest';
import { graphql, parse, valueFromASTUntyped } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { Permissions } from 'meteor/idreesia-common/constants';
import {
  gqlContext,
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import CheckPermissionsSchema from './_directives/check-permissions';
import CheckInstanceAccessSchema from './_directives/check-instance-access';
import SuperAdminOnlySchema from './_directives/super-admin-only';
import PermissionSchema from './_directives/permission';
import {
  CheckInstanceAccessDirective,
  CheckPermissionsDirective,
  SuperAdminOnlyDirective,
} from './_directives';

// Reads every Query/Mutation field from the real SDL, records its access
// declaration, and then executes each declared check against the real
// directive implementations: anonymous, locked, unrelated, each listed
// permission, and super-admin. A pinned snapshot makes any change to who may
// call a field a reviewed diff.

interface Declaration {
  directive: string;
  args: Record<string, unknown>;
}
type FieldInfo = { field: string; declarations: Declaration[] };

// Workspace directives, checked by their own tests rather than probed here.
const WORKSPACE_DIRECTIVES = [
  'checkCommitteeAccess',
  'checkDutiesAttendanceAccess',
  'checkMehfilDetailsAccess',
  'checkMehfilKarkunsAccess',
  'checkMehfilPermissionsAccess',
];

const PROTECTION = [
  'checkPermissions',
  'checkInstanceAccess',
  'checkCommitteeAccess',
  'checkDutiesAttendanceAccess',
  'checkMehfilDetailsAccess',
  'checkMehfilKarkunsAccess',
  'checkMehfilPermissionsAccess',
  'superAdminOnly',
];

const sdlBlocks = globSync(join(__dirname, '**/*.ts').replace(/\\/g, '/'), {
  ignore: ['**/node_modules/**', '**/generated/**', '**/*.test.ts'],
})
  .sort()
  .flatMap(file =>
    [...readFileSync(file, 'utf8').matchAll(/gql`([\s\S]*?)`/g)].map(m =>
      m[1].trim()
    )
  );

const document = parse(['type Query', 'type Mutation', ...sdlBlocks].join('\n\n'));

const fields: FieldInfo[] = [];
for (const def of document.definitions) {
  if (def.kind !== 'ObjectTypeDefinition' && def.kind !== 'ObjectTypeExtension')
    continue;
  if (def.name.value !== 'Query' && def.name.value !== 'Mutation') continue;
  for (const f of def.fields ?? []) {
    const declarations = (f.directives ?? [])
      .filter(d => PROTECTION.includes(d.name.value))
      .map(d => ({
        directive: d.name.value,
        args: Object.fromEntries(
          (d.arguments ?? []).map(a => [
            a.name.value,
            valueFromASTUntyped(a.value),
          ])
        ),
      }));
    fields.push({ field: `${def.name.value}.${f.name.value}`, declarations });
  }
}

const protectedFields = fields.filter(f => f.declarations.length > 0);
const permissionFields = protectedFields.filter(f =>
  f.declarations.some(d => d.directive === 'checkPermissions')
);

const perm = (name: string) => (Permissions as Record<string, string>)[name];

// Builds a one-field schema carrying exactly the declaration under test.
const probe = (info: FieldInfo) => {
  const isMutation = info.field.startsWith('Mutation.');
  const directives = info.declarations
    .filter(d => !WORKSPACE_DIRECTIVES.includes(d.directive))
    .map(d => {
      if (d.directive === 'superAdminOnly') return '@superAdminOnly';
      const args = Object.entries(d.args)
        .map(([k, v]) =>
          k === 'permissions'
            ? `${k}: [${(v as string[]).join(', ')}]`
            : `${k}: ${JSON.stringify(v)}`
        )
        .join(', ');
      return `@${d.directive}(${args})`;
    })
    .join(' ');
  const instanceArg = info.declarations.find(
    d => d.directive === 'checkInstanceAccess'
  )?.args.instanceIdArgName as string | undefined;
  const argList = instanceArg ? `(${instanceArg}: String)` : '';
  const returnType =
    info.field.split('.')[1].startsWith('paged') ||
    info.declarations.some(
      d =>
        d.directive === 'checkInstanceAccess' &&
        d.args.returnType === 'paged-list'
    )
      ? 'Page'
      : 'String';
  const root = isMutation ? 'Mutation' : 'Query';
  const typeDefs = [
    CheckPermissionsSchema,
    CheckInstanceAccessSchema,
    SuperAdminOnlySchema,
    PermissionSchema,
    `type Page { data: [String!]!, totalResults: Int! }
     type Query { ok: String }
     type Mutation { ok: String }
     extend type ${root} { target${argList}: ${returnType} ${directives} }`,
  ];
  const resolved = returnType === 'Page' ? { data: [], totalResults: 1 } : 'RAN';
  const schema = SuperAdminOnlyDirective(
    CheckInstanceAccessDirective(
      CheckPermissionsDirective(
        makeExecutableSchema({
          typeDefs,
          resolvers: { [root]: { target: () => resolved } },
        })
      )
    )
  );
  const selection = returnType === 'Page' ? '{ totalResults }' : '';
  const args = instanceArg ? `(${instanceArg}: "instance-1")` : '';
  const source = `${isMutation ? 'mutation' : 'query'} { target${args} ${selection} }`;
  return (user: unknown) =>
    graphql({ schema, source, contextValue: gqlContext(user as never) });
};

const ran = (r: Awaited<ReturnType<ReturnType<typeof probe>>>) =>
  r.errors === undefined &&
  (r.data?.target === 'RAN' ||
    (r.data?.target as { totalResults?: number } | null)?.totalResults === 1);

describe('authorization matrix', () => {
  it('finds a realistic number of protected fields', () => {
    expect(permissionFields.length).toBeGreaterThan(150);
    expect(protectedFields.length).toBeGreaterThan(300);
  });

  it('pins every field → access declaration', () => {
    const pinned = Object.fromEntries(
      protectedFields.map(f => [f.field, f.declarations])
    );
    expect(pinned).toMatchSnapshot();
  });

  it('every @checkPermissions list is non-empty and uses known permissions', () => {
    for (const f of permissionFields) {
      for (const d of f.declarations.filter(
        x => x.directive === 'checkPermissions'
      )) {
        const list = d.args.permissions as string[] | undefined;
        expect(list?.length, f.field).toBeGreaterThan(0);
        for (const p of list!) expect(perm(p), `${f.field}: ${p}`).toBeTruthy();
      }
    }
  });

  it('every @checkInstanceAccess field names an instance argument', () => {
    for (const f of protectedFields) {
      for (const d of f.declarations.filter(
        x => x.directive === 'checkInstanceAccess'
      )) {
        expect(d.args.instanceIdArgName, f.field).toBeTruthy();
      }
    }
  });

  // Fields that check the instance but carry no permission check; the
  // permission, if any, is enforced elsewhere. Adding to this list is a
  // conscious decision.
  const INSTANCE_ONLY_QUERIES = protectedFields
    .filter(
      f =>
        f.declarations.some(d => d.directive === 'checkInstanceAccess') &&
        !f.declarations.some(d => d.directive === 'checkPermissions')
    )
    .map(f => f.field)
    .sort();

  it('pins the fields that check instance access without a permission', () => {
    expect(INSTANCE_ONLY_QUERIES).toMatchSnapshot();
  });

  describe.each(protectedFields.filter(f =>
    f.declarations.some(d => !WORKSPACE_DIRECTIVES.includes(d.directive))
  ).map(f => [f.field, f] as const))('%s', (_name, info) => {
    const run = probe(info);
    const perms = (
      info.declarations.find(d => d.directive === 'checkPermissions')?.args
        .permissions as string[] | undefined
    )?.map(perm);
    const instance = info.declarations.some(
      d => d.directive === 'checkInstanceAccess'
    );
    const superOnly = info.declarations.some(d => d.directive === 'superAdminOnly');

    it('denies anonymous and locked callers', async () => {
      for (const user of [
        undefined,
        makeLockedUser({
          permissions: perms ?? [],
          instances: ['instance-1'],
          isSuperAdmin: true,
        }),
      ]) {
        expect(ran(await run(user))).toBe(false);
      }
    });

    it('denies a caller with no matching grant', async () => {
      expect(
        ran(await run(makeUser({ permissions: ['UNRELATED'], instances: ['other'] })))
      ).toBe(false);
    });

    it('allows a super-admin', async () => {
      expect(ran(await run(makeSuperAdmin()))).toBe(true);
    });

    if (perms) {
      it.each(perms)('allows holder of %s', async p => {
        const user = makeUser({
          permissions: [p],
          instances: instance ? ['instance-1'] : [],
        });
        expect(ran(await run(user))).toBe(true);
      });
    }

    if (instance && !superOnly) {
      it('denies a permitted caller without the instance', async () => {
        const user = makeUser({ permissions: perms ?? [], instances: ['other'] });
        expect(ran(await run(user))).toBe(false);
      });
    }

    if (superOnly) {
      it('denies a non-super-admin even with every permission', async () => {
        const user = makeUser({ permissions: Object.values(Permissions) });
        expect(ran(await run(user))).toBe(false);
      });
    }
  });
});
