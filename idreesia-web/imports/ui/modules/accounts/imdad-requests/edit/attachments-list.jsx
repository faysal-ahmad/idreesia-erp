import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { message } from '/imports/ui/controls';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  ACCOUNTS_IMDAD_REQUEST_BY_ID,
  ADD_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT,
  REMOVE_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT,
} from '../gql';

const AttachmentsList = ({ requestId }) => {
  const [addAccountsImdadRequestAttachment] = useMutation(
    ADD_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT
  );
  const [removeAccountsImdadRequestAttachment] = useMutation(
    REMOVE_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT
  );

  const { data, loading } = useQuery(ACCOUNTS_IMDAD_REQUEST_BY_ID, {
    variables: { _id: requestId },
  });

  if (loading) return null;
  const { accountsImdadRequestById } = data;

  const handleAttachmentAdded = attachmentId => {
    addAccountsImdadRequestAttachment({
      variables: {
        _id: requestId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleAttachmentRemoved = attachmentId => {
    removeAccountsImdadRequestAttachment({
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
      attachments={accountsImdadRequestById.attachments}
      handleAttachmentAdded={handleAttachmentAdded}
      handleAttachmentRemoved={handleAttachmentRemoved}
    />
  );
};

AttachmentsList.propTypes = {
  requestId: PropTypes.string,
};

export default AttachmentsList;
