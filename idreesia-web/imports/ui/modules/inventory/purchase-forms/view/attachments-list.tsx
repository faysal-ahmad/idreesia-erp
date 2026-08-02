import React from 'react';
import type { InventoryPurchaseFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

type PurchaseForm = NonNullable<InventoryPurchaseFormByIdQuery['purchaseFormById']>;

interface Props {
  purchaseFormById: PurchaseForm;
}

export const AttachmentsList = ({ purchaseFormById }: Props) => (
  <AttachmentsListControl
    canEditAttachments={false}
    attachments={(purchaseFormById.attachments ?? undefined) as Parameters<typeof AttachmentsListControl>[0]['attachments']}
  />
);
