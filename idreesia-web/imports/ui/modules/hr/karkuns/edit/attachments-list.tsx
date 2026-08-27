import React from 'react';
import { Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type match } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AttachmentsListControl
      canUploadDocument
      canEditAttachments
      attachments={(data?.hrKarkunById?.karkunData?.attachments ?? []) as any}
      handleAttachmentAdded={handleAttachmentAdded}
      handleAttachmentRemoved={handleAttachmentRemoved}
    />
  );
};

export default AttachmentsList;
