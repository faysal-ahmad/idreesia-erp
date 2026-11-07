import React from 'react';
import type { InventoryPurchaseFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';
import { AttachmentCategory } from 'meteor/idreesia-common/constants';

type PurchaseForm = NonNullable<InventoryPurchaseFormByIdQuery['purchaseFormById']>;

interface Props {
  purchaseFormById: PurchaseForm;
}

export const AttachmentsList = ({ purchaseFormById }: Props) => (
  <AttachmentsListControl
    category={AttachmentCategory.PURCHASE_FORM}
    canEditAttachments={false}
    attachments={(purchaseFormById.attachments ?? undefined) as Parameters<typeof AttachmentsListControl>[0]['attachments']}
  />
);
