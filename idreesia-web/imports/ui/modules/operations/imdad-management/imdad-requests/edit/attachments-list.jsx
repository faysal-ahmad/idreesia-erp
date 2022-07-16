import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { message } from 'antd';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  OPERATIONS_IMDAD_REQUEST_BY_ID,
  ADD_OPERATIONS_IMDAD_REQUEST_ATTACHMENT,
  REMOVE_OPERATIONS_IMDAD_REQUEST_ATTACHMENT,
} from '../gql';

const AttachmentsList = ({ requestId }) => {
  const [addOperationsImdadRequestAttachment] = useMutation(
    ADD_OPERATIONS_IMDAD_REQUEST_ATTACHMENT
  );
  const [removeOperationsImdadRequestAttachment] = useMutation(
    REMOVE_OPERATIONS_IMDAD_REQUEST_ATTACHMENT
  );

  const { data, loading } = useQuery(OPERATIONS_IMDAD_REQUEST_BY_ID, {
    variables: { _id: requestId },
  });

  if (loading) return null;
  const { operationsImdadRequestById } = data;

  const handleAttachmentAdded = attachmentId => {
    addOperationsImdadRequestAttachment({
      variables: {
        _id: requestId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleAttachmentRemoved = attachmentId => {
    removeOperationsImdadRequestAttachment({
      variables: {
        _id: requestId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  return (
    <AttachmentsListControl
      attachments={operationsImdadRequestById.attachments}
      handleAttachmentAdded={handleAttachmentAdded}
      handleAttachmentRemoved={handleAttachmentRemoved}
    />
  );
};

AttachmentsList.propTypes = {
  requestId: PropTypes.string,
};

export default AttachmentsList;
