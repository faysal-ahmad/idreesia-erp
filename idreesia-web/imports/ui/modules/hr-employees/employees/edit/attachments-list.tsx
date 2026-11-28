import React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';
import { AttachmentCategory } from 'meteor/idreesia-common/constants';

import {
  HR_EMPLOYEE_BY_ID,
  ADD_HR_EMPLOYEE_ATTACHMENT,
  REMOVE_HR_EMPLOYEE_ATTACHMENT,
} from '../gql';

interface Props {
  employeeId: string;
}

const AttachmentsList = ({ employeeId }: Props) => {
  const { data, loading } = useQuery(HR_EMPLOYEE_BY_ID, {
    variables: { _id: employeeId },
  });
  const [addHrEmployeeAttachment] = useMutation(ADD_HR_EMPLOYEE_ATTACHMENT, {
    refetchQueries: ['hrEmployeeById'],
  });
  const [removeHrEmployeeAttachment] = useMutation(REMOVE_HR_EMPLOYEE_ATTACHMENT, {
    refetchQueries: ['hrEmployeeById'],
  });

  const handleAttachmentAdded = (attachmentId: string) => {
    addHrEmployeeAttachment({
      variables: {
        _id: employeeId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleAttachmentRemoved = (attachmentId: string) => {
    removeHrEmployeeAttachment({
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
      category={AttachmentCategory.PROFILE}
      canUploadDocument
      canEditAttachments
      attachments={(data?.hrEmployeeById?.karkunData?.attachments ?? []) as any}
      handleAttachmentAdded={handleAttachmentAdded}
      handleAttachmentRemoved={handleAttachmentRemoved}
    />
  );
};

export default AttachmentsList;
