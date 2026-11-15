import { describe, expect, it } from 'vitest';
import { getDirective } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';

import CheckCommitteeAccessSchema from '../_directives/check-committee-access';
import MonitoringAlertsSchema from './monitoring-alerts/monitoring-alerts';
import MonitoringProfilesSchema from './monitoring-profiles/monitoring-profiles';
import NightStayReportSchema from './night-stay-report/night-stay-report';

const schema = makeExecutableSchema({
  typeDefs: [
    CheckCommitteeAccessSchema,
    'type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }',
    MonitoringAlertsSchema,
    MonitoringProfilesSchema,
    NightStayReportSchema,
  ],
});

type Root = 'Query' | 'Mutation';

const fieldsOf = (root: Root) =>
  Object.entries(
    (root === 'Query' ? schema.getQueryType() : schema.getMutationType())!.getFields()
  ).filter(([name]) => name !== '_placeholder');

const rolesOf = (root: Root, name: string) => {
  const field = fieldsOf(root).find(([n]) => n === name)![1];
  const directive = getDirective(schema, field, 'checkCommitteeAccess')?.[0];
  return directive ? [...(directive.roles as string[])].sort() : undefined;
};

const READ = ['COORDINATOR', 'MEMBER', 'OBSERVER'];
const WRITE = ['COORDINATOR', 'MEMBER'];

// Monitoring profiles, monitoring alerts and the night stay report: observers
// only look, guests have no access.
const expected: Array<[Root, string, string[]]> = [
  ['Query', 'workspaceMonitoringProfiles', READ],
  ['Query', 'workspaceMonitoringProfileById', READ],
  ['Mutation', 'updateWorkspaceMonitoringProfile', WRITE],
  ['Mutation', 'addWorkspaceMonitoringProfilePhoto', WRITE],
  ['Mutation', 'removeWorkspaceMonitoringProfilePhoto', WRITE],
  ['Query', 'workspaceMonitoringAlerts', READ],
  ['Query', 'workspaceNightStays', READ],
  ['Query', 'workspaceNightStayById', READ],
];

describe('monitoring and night stay role rules', () => {
  it.each(expected)('%s %s', (root, name, roles) => {
    expect(rolesOf(root, name)).toEqual([...roles].sort());
  });

  it('covers every operation, and none lets guests in', () => {
    const declared = (['Query', 'Mutation'] as Root[]).flatMap(root =>
      fieldsOf(root).map(([name]) => `${root}.${name}`)
    );
    expect(declared.sort()).toEqual(
      expected.map(([root, name]) => `${root}.${name}`).sort()
    );
    expected.forEach(([, , roles]) => expect(roles).not.toContain('GUEST'));
  });
});
