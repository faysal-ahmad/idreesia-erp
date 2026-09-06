import React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  HR_KARKUN_BY_ID,
  ADD_HR_KARKUN_ATTACHMENT,
  REMOVE_HR_KARKUN_ATTACHMENT,
} from '../gql';

interface Props {
  employeeId: string;
}

const AttachmentsList = ({ employeeId }: Props) => {
  const { data, loading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: employeeId },
  });
  const [addHrKarkunAttachment] = useMutation(ADD_HR_KARKUN_ATTACHMENT, {
    refetchQueries: ['hrKarkunByIdForPeople'],
  });
  const [removeHrKarkunAttachment] = useMutation(REMOVE_HR_KARKUN_ATTACHMENT, {
    refetchQueries: ['hrKarkunByIdForPeople'],
  });

  const handleAttachmentAdded = (attachmentId: string) => {
    addHrKarkunAttachment({
      variables: {
        _id: employeeId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleAttachmentRemoved = (attachmentId: string) => {
    removeHrKarkunAttachment({
      variables: {
        _id: employeeId,
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
