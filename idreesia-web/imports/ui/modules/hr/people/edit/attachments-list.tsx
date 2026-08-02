import React from 'react';
import { type match } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';

import { message } from 'antd';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  HR_KARKUN_BY_ID,
  ADD_HR_KARKUN_ATTACHMENT,
  REMOVE_HR_KARKUN_ATTACHMENT,
} from '../gql';

interface Props { match: match<{ karkunId: string }>; karkunId: string; }

const AttachmentsList = ({ karkunId, match }: Props) => {
  const { data, loading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: match.params.karkunId },
  });
  const [addHrKarkunAttachment] = useMutation(ADD_HR_KARKUN_ATTACHMENT);
  const [removeHrKarkunAttachment] = useMutation(REMOVE_HR_KARKUN_ATTACHMENT);

  const handleAttachmentAdded = (attachmentId: string) => {
    addHrKarkunAttachment({
      variables: {
        _id: karkunId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleAttachmentRemoved = (attachmentId: string) => {
    removeHrKarkunAttachment({
      variables: {
        _id: karkunId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  if (loading) return null;

  return (
    <AttachmentsListControl
      canUploadDocument
      canEditAttachments
      attachments={(data?.hrKarkunById?.attachments ?? []) as any}
      handleAttachmentAdded={handleAttachmentAdded}
      handleAttachmentRemoved={handleAttachmentRemoved}
    />
  );
};

export default AttachmentsList;
