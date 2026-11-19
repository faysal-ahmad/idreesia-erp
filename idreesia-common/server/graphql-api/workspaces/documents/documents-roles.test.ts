import { describe, expect, it } from 'vitest';
import { getDirective } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';

import CheckCommitteeAccessSchema from '../../_directives/check-committee-access';
import DocumentsSchema from './documents';

const schema = makeExecutableSchema({
  typeDefs: [
    CheckCommitteeAccessSchema,
    'type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }',
    DocumentsSchema,
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

const C = ['COORDINATOR'];
const VIEW = ['COORDINATOR', 'MEMBER', 'OBSERVER'];
const WRITE = ['COORDINATOR', 'MEMBER'];

// The role rules in docs/headless-modules/dms-design-and-usage.md. Guests
// have no access to documents.
const expected: Array<[Root, string, string[]]> = [
  ...[
    'workspaceDocumentsInfo',
    'workspaceDocumentFolderContents',
    'workspaceDocumentFolders',
    'workspaceDocumentSearch',
    'workspaceDocumentById',
    'workspaceDocumentVersions',
    'workspaceDocumentActivity',
    'workspaceDocumentTrash',
  ].map((name): [Root, string, string[]] => ['Query', name, VIEW]),
  ['Mutation', 'workspaceDocumentDownloadUrl', VIEW],
  ...[
    'workspaceCreateDocumentFolder',
    'workspaceRenameDocumentFolder',
    'workspaceMoveDocumentFolder',
    'workspaceTrashDocumentFolder',
    'workspaceCreateDocumentUpload',
    'workspaceCompleteDocumentUpload',
    'workspaceAbortDocumentUpload',
    'workspaceUpdateDocument',
    'workspaceMoveDocument',
    'workspaceTrashDocument',
    'workspaceRestoreDocumentVersion',
    'workspaceCheckOutDocument',
    'workspaceCheckInDocument',
    'workspaceRestoreDocumentTrashItem',
  ].map((name): [Root, string, string[]] => ['Mutation', name, WRITE]),
  ...[
    'workspaceDeleteDocumentVersion',
    'workspaceForceUnlockDocument',
    'workspacePurgeDocumentTrashItem',
    'workspaceEmptyDocumentTrash',
  ].map((name): [Root, string, string[]] => ['Mutation', name, C]),
];

describe('documents role rules', () => {
  it.each(expected)('%s %s', (root, name, roles) => {
    expect(rolesOf(root, name)).toEqual([...roles].sort());
  });

  it('covers every documents operation, and none lets guests in', () => {
    const declared = (['Query', 'Mutation'] as Root[]).flatMap(root =>
      fieldsOf(root).map(([name]) => `${root}.${name}`)
    );
    expect(declared.sort()).toEqual(
      expected.map(([root, name]) => `${root}.${name}`).sort()
    );
    expected.forEach(([, , roles]) => expect(roles).not.toContain('GUEST'));
  });
});
