import { PurchasingAttachments } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  abortAttachmentUpload,
  completeAttachmentUpload,
  createAttachmentUpload,
  deleteAttachment,
  getAttachmentDownload,
  listAttachments,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { AttachmentOwnerTypeValue } from 'meteor/idreesia-common/constants/purchasing';

import { assertCanAccessAttachments } from './access';

interface ResolverContext {
  user: {
    _id: string;
    username?: string;
    locked?: boolean;
    isSuperAdmin?: boolean;
    permissions?: string[];
  };
}

/** The kind of document an existing attachment is on, for the permission check. */
async function ownerTypeOf(attachmentId: string) {
  const attachment = await PurchasingAttachments.findOneAsync({ _id: { $eq: attachmentId } });
  return attachment?.ownerType ?? '';
}

export default {
  Query: {
    purchasingAttachments: async (
      _obj: unknown,
      { ownerType, ownerId }: { ownerType: AttachmentOwnerTypeValue; ownerId: string },
      { user }: ResolverContext
    ) => {
      assertCanAccessAttachments(user, ownerType, 'view');
      return listAttachments(ownerType, ownerId);
    },

    purchasingAttachmentDownload: async (
      _obj: unknown,
      { _id, inline }: { _id: string; inline?: boolean },
      { user }: ResolverContext
    ) => {
      assertCanAccessAttachments(user, await ownerTypeOf(_id), 'view');
      return getAttachmentDownload(_id, { inline: !!inline });
    },
  },

  Mutation: {
    createPurchasingAttachmentUpload: async (
      _obj: unknown,
      args: {
        ownerType: AttachmentOwnerTypeValue;
        ownerId: string;
        fileName: string;
        mimeType: string;
        size: number;
        name?: string;
      },
      { user }: ResolverContext
    ) => {
      assertCanAccessAttachments(user, args.ownerType, 'manage');
      return createAttachmentUpload(args, user);
    },

    completePurchasingAttachmentUpload: async (
      _obj: unknown,
      { uploadId }: { uploadId: string },
      { user }: ResolverContext
    ) => {
      assertCanAccessAttachments(user, await ownerTypeOf(uploadId), 'manage');
      return completeAttachmentUpload(uploadId, user);
    },

    abortPurchasingAttachmentUpload: async (
      _obj: unknown,
      { uploadId }: { uploadId: string },
      { user }: ResolverContext
    ) => {
      assertCanAccessAttachments(user, await ownerTypeOf(uploadId), 'manage');
      await abortAttachmentUpload(uploadId, user);
      return true;
    },

    deletePurchasingAttachment: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => {
      assertCanAccessAttachments(user, await ownerTypeOf(_id), 'manage');
      await deleteAttachment(_id, user);
      return true;
    },
  },
};
