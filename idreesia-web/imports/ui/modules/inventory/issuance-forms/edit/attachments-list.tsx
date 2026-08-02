import React from 'react';
import { useMutation } from '@apollo/client/react';
import { message } from 'antd';
import type { IssuanceFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';

import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';
import {
  ADD_ISSUANCE_FORM_ATTACHMENT,
  REMOVE_ISSUANCE_FORM_ATTACHMENT,
} from '../gql';

type IssuanceForm = NonNullable<IssuanceFormByIdQuery['issuanceFormById']>;

interface Props {
  physicalStoreId: string;
  issuanceFormById: IssuanceForm;
}

const AttachmentsList = ({ physicalStoreId, issuanceFormById }: Props) => {
  const [addIssuanceFormAttachment] = useMutation(ADD_ISSUANCE_FORM_ATTACHMENT);
  const [removeIssuanceFormAttachment] = useMutation(REMOVE_ISSUANCE_FORM_ATTACHMENT);

  const formId = issuanceFormById._id as string;

  const handleAttachmentAdded = (attachmentId: string) => {
    addIssuanceFormAttachment({
      variables: {
        _id: formId,
        physicalStoreId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleAttachmentRemoved = (attachmentId: string) => {
    removeIssuanceFormAttachment({
      variables: {
        _id: formId,
        physicalStoreId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  return (
    <AttachmentsListControl
      canEditAttachments
      canUploadDocument
      attachments={(issuanceFormById.attachments ?? undefined) as Parameters<typeof AttachmentsListControl>[0]['attachments']}
      handleAttachmentAdded={handleAttachmentAdded}
      handleAttachmentRemoved={handleAttachmentRemoved}
    />
  );
};

export default AttachmentsList;
