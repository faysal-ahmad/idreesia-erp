import { describe, expect, it } from 'vitest';
import { getDirective } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';

import CheckCommitteeAccessSchema from '../../_directives/check-committee-access';
import DiscussionsSchema from '../discussions/discussions';
import ProjectsSchema from './projects';

const schema = makeExecutableSchema({
  typeDefs: [
    CheckCommitteeAccessSchema,
    'type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }',
    DiscussionsSchema,
    ProjectsSchema,
  ],
});

type Root = 'Query' | 'Mutation';

// Project chat is being removed and is not covered by these rules.
const fieldsOf = (root: Root) =>
  Object.entries(
    (root === 'Query' ? schema.getQueryType() : schema.getMutationType())!.getFields()
  ).filter(([name]) => name !== '_placeholder' && !name.includes('Discussion'));

const rolesOf = (root: Root, name: string) => {
  const field = fieldsOf(root).find(([n]) => n === name)![1];
  const directive = getDirective(schema, field, 'checkCommitteeAccess')?.[0];
  return directive ? [...(directive.roles as string[])].sort() : undefined;
};

const C = ['COORDINATOR'];
const ALL = ['COORDINATOR', 'GUEST', 'MEMBER', 'OBSERVER'];
const ACT = ['COORDINATOR', 'GUEST', 'MEMBER'];

// The role rules in docs/headless-modules/projects-design-and-usage.md. A
// guest sees and acts only in the projects they take part in; that part is
// checked in the resolvers (guest-access.test.ts).
const expected: Array<[Root, string, string[]]> = [
  ...[
    'workspaceProjectsInfo',
    'workspaceProjectMembers',
    'workspaceProjects',
    'workspaceProjectById',
    'workspaceTasks',
    'workspaceTaskById',
    'workspaceTaskComments',
  ].map((name): [Root, string, string[]] => ['Query', name, ALL]),
  ['Query', 'workspaceProjectsActivity', C],
  ...[
    'workspaceCreateProject',
    'workspaceUpdateProject',
    'workspaceSetProjectStatus',
    'workspaceAddProjectParticipants',
    'workspaceRemoveProjectParticipant',
    'workspaceDeleteProject',
    'workspaceCreateTask',
    'workspaceUpdateTask',
    'workspaceDeleteTask',
  ].map((name): [Root, string, string[]] => ['Mutation', name, C]),
  ...[
    'workspaceSetTaskStatus',
    'workspaceSetTaskProgress',
    'workspaceAddTaskComment',
    'workspaceDeleteTaskComment',
  ].map((name): [Root, string, string[]] => ['Mutation', name, ACT]),
];

describe('projects role rules', () => {
  it.each(expected)('%s %s', (root, name, roles) => {
    expect(rolesOf(root, name)).toEqual([...roles].sort());
  });

  it('covers every projects operation', () => {
    const declared = (['Query', 'Mutation'] as Root[]).flatMap(root =>
      fieldsOf(root).map(([name]) => `${root}.${name}`)
    );
    expect(declared.sort()).toEqual(
      expected.map(([root, name]) => `${root}.${name}`).sort()
    );
  });
});
