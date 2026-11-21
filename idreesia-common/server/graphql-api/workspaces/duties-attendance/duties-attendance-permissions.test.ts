import { describe, expect, it } from 'vitest';
import { getDirective } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';

import CheckDutiesAttendanceAccessSchema from '../../_directives/check-duties-attendance-access';
import DutiesAttendanceSchema from './duties-attendance';

const schema = makeExecutableSchema({
  typeDefs: [
    CheckDutiesAttendanceAccessSchema,
    'type PersonBasicType { _id: String } type PagedWorkspaceKarkunType { totalResults: Int } type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }',
    DutiesAttendanceSchema,
  ],
});

const permissionOf = (root: 'Query' | 'Mutation', name: string) => {
  const type = root === 'Query' ? schema.getQueryType() : schema.getMutationType();
  const field = type!.getFields()[name];
  const directive = getDirective(schema, field, 'checkDutiesAttendanceAccess')?.[0];
  return directive?.permission as string | undefined;
};

const VIEW = 'VIEW';
const MANAGE = 'MANAGE_AND_PLAN_DUTIES';
const MARK = 'MARK_ATTENDANCE';

// The permission each operation needs, as in the module's design document.
const expected: Array<['Query' | 'Mutation', string, string]> = [
  ['Query', 'workspaceDaAccess', VIEW],
  ['Query', 'workspaceDaDuties', VIEW],
  ['Query', 'workspaceDaDutyById', VIEW],
  ['Query', 'workspaceDaPlanDays', VIEW],
  ['Query', 'workspaceDaAttendanceSheet', VIEW],
  ['Query', 'workspaceDaKarkunSearch', MANAGE],
  ['Query', 'workspaceDaMehfilDuties', MANAGE],
  ['Mutation', 'workspaceDaAddDuties', MANAGE],
  ['Mutation', 'workspaceDaUpdateDuty', MANAGE],
  ['Mutation', 'workspaceDaRemoveDuty', MANAGE],
  ['Mutation', 'workspaceDaAddDutyMember', MANAGE],
  ['Mutation', 'workspaceDaUpdateDutyMember', MANAGE],
  ['Mutation', 'workspaceDaRemoveDutyMember', MANAGE],
  ['Mutation', 'workspaceDaSetDayOverride', MANAGE],
  ['Mutation', 'workspaceDaSetAttendance', MARK],
];

describe('duties and attendance permission rules', () => {
  it.each(expected)('%s %s', (root, name, permission) => {
    expect(permissionOf(root, name)).toBe(permission);
  });

  it('covers every workspace operation, each with a location argument', () => {
    const declared = (['Query', 'Mutation'] as const).flatMap(root => {
      const type = root === 'Query' ? schema.getQueryType() : schema.getMutationType();
      return Object.entries(type!.getFields())
        .filter(([name]) => name.startsWith('workspaceDa'))
        .map(([name, field]) => {
          expect(
            field.args.some(arg => arg.name === 'locationId'),
            name
          ).toBe(true);
          return `${root}.${name}`;
        });
    });
    expect(declared.sort()).toEqual(
      expected.map(([root, name]) => `${root}.${name}`).sort()
    );
  });
});
