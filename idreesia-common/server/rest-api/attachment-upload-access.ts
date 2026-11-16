import {
  isAllowedAttachmentMimeType,
  type AttachmentCategoryValue,
} from 'meteor/idreesia-common/constants';
import { isAttachmentCategory } from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';
import {
  canUploadAttachment,
  type AttachmentUser,
} from 'meteor/idreesia-common/server/graphql-api/common/attachment/access';

export type UploadDecision =
  | { ok: true; category: AttachmentCategoryValue }
  | { ok: false; reason: 'invalid' | 'forbidden' | 'type-not-allowed' };

/**
 * The checks /upload-file and /upload-base64-file share, in this order: a
 * payload and a valid category, then the category's manage permission, then a
 * file type a browser won't run as a page (no HTML or SVG).
 */
export function decideAttachmentUpload(
  user: AttachmentUser | null | undefined,
  input: { category: unknown; hasContent: boolean; mimeType: string }
): UploadDecision {
  const { category } = input;
  if (!input.hasContent || !isAttachmentCategory(category)) {
    return { ok: false, reason: 'invalid' };
  }
  if (!canUploadAttachment(user, category)) {
    return { ok: false, reason: 'forbidden' };
  }
  if (!isAllowedAttachmentMimeType(input.mimeType)) {
    return { ok: false, reason: 'type-not-allowed' };
  }
  return { ok: true, category };
}

/** The HTTP status for an error thrown by assertCanViewAttachment. */
export const downloadErrorStatus = (error: unknown): 403 | 404 | null => {
  const code = (error as { extensions?: { code?: string } })?.extensions?.code;
  if (code === 'FORBIDDEN') return 403;
  if (code === 'NOT_FOUND') return 404;
  return null;
};
