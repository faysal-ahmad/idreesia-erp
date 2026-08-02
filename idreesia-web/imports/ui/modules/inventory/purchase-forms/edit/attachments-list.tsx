import React from 'react';
import { useMutation } from '@apollo/client/react';
import { message } from 'antd';
import type { InventoryPurchaseFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';
import { ADD_PURCHASE_FORM_ATTACHMENT, REMOVE_PURCHASE_FORM_ATTACHMENT } from '../gql';

type PurchaseForm = NonNullable<InventoryPurchaseFormByIdQuery['purchaseFormById']>;

interface Props {
  physicalStoreId: string;
  purchaseFormById: PurchaseForm;
}

const AttachmentsList = ({ physicalStoreId, purchaseFormById }: Props) => {
  const formId = purchaseFormById._id as string;
  const [addPurchaseFormAttachment] = useMutation(ADD_PURCHASE_FORM_ATTACHMENT);
  const [removePurchaseFormAttachment] = useMutation(REMOVE_PURCHASE_FORM_ATTACHMENT);

  return (
    <AttachmentsListControl
      canUploadDocument
      canEditAttachments
      attachments={(purchaseFormById.attachments ?? undefined) as Parameters<typeof AttachmentsListControl>[0]['attachments']}
      handleAttachmentAdded={(attachmentId) => {
        addPurchaseFormAttachment({ variables: { _id: formId, physicalStoreId, attachmentId } })
          .catch((error: Error) => message.error(error.message, 5));
      }}
      handleAttachmentRemoved={(attachmentId) => {
        removePurchaseFormAttachment({ variables: { _id: formId, physicalStoreId, attachmentId } })
          .catch((error: Error) => message.error(error.message, 5));
      }}
    />
  );
};

export default AttachmentsList;
