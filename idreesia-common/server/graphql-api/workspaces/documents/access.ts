import { GraphQLError } from 'graphql';

import {
  getDocument,
  getFolder,
} from 'meteor/idreesia-common/server/business-logic/dms';
import {
  getCommitteeDmsWorkspaceId,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  getMemberCommittee,
  isCommitteeCoordinator,
  type WorkspaceUser,
} from '../committee/access';

export interface DocumentsAccess {
  /** The committee's DMS workspace. */
  workspaceId: string;
  /** The acting ERP user, passed to every DMS call. */
  userId: string;
  isCoordinator: boolean;
}

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

const notFound = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });

/**
 * Permission check for a committee's documents: the user must be a member
 * of the committee (erp-admin counts as one), and the committee must have
 * Documents enabled. With `coordinator`, only its coordinators pass - for
 * purging, emptying the trash, deleting versions and force-unlocking.
 */
export const getDocumentsAccess = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string,
  { coordinator = false }: { coordinator?: boolean } = {}
): Promise<DocumentsAccess> => {
  const committee = await getMemberCommittee(user, committeeId);
  if (!committee || !user?._id) {
    throw forbidden('You are not a member of this committee.');
  }
  const workspaceId = getCommitteeDmsWorkspaceId(
    committee as unknown as CommitteeDoc
  );
  const isCoordinator = isCommitteeCoordinator(user, committee);
  if (coordinator && !isCoordinator) {
    throw forbidden('Only coordinators of this committee can do this.');
  }
  return { workspaceId, userId: user._id, isCoordinator };
};

/*
 * The DMS takes item ids on their own, so each id from the client is checked
 * to belong to the committee's workspace before it is acted on.
 */

export const assertDocumentInWorkspace = async (
  access: DocumentsAccess,
  documentId: string
) => {
  const document = await getDocument(documentId, access.userId, {
    includeTrashed: true,
  });
  if (document.workspaceId !== access.workspaceId) {
    throw notFound('Document not found');
  }
};

export const assertFolderInWorkspace = async (
  access: DocumentsAccess,
  folderId: string | null | undefined
) => {
  if (!folderId) return;
  const folder = await getFolder(folderId, access.userId, {
    includeTrashed: true,
  });
  if (folder.workspaceId !== access.workspaceId) {
    throw notFound('Folder not found');
  }
};

/** A trash item is a folder or a document. */
export const assertTrashItemInWorkspace = async (
  access: DocumentsAccess,
  itemId: string
) => {
  const item =
    (await getFolder(itemId, access.userId, { includeTrashed: true }).catch(
      () => null
    )) ??
    (await getDocument(itemId, access.userId, { includeTrashed: true }).catch(
      () => null
    ));
  if (!item || item.workspaceId !== access.workspaceId) {
    throw notFound('Item not found in the trash');
  }
};
