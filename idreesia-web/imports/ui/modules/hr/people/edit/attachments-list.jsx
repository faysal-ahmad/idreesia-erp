import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';

import { message } from 'antd';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  HR_KARKUN_BY_ID,
  ADD_HR_KARKUN_ATTACHMENT,
  REMOVE_HR_KARKUN_ATTACHMENT,
} from '../gql';

const AttachmentsList = ({ match, karkunId }) => {
  const { data, loading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: match.params.karkunId },
  });
  const [addHrKarkunAttachment] = useMutation(ADD_HR_KARKUN_ATTACHMENT);
  const [removeHrKarkunAttachment] = useMutation(REMOVE_HR_KARKUN_ATTACHMENT);
  const { hrKarkunById } = data || {};

  const handleAttachmentAdded = attachmentId => {
    addHrKarkunAttachment({
      variables: {
        _id: karkunId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleAttachmentRemoved = attachmentId => {
    removeHrKarkunAttachment({
      variables: {
        _id: karkunId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  if (loading) return null;

  return (
    <AttachmentsListControl
      canUploadDocument
      canEditAttachments
      attachments={hrKarkunById.attachments}
      handleAttachmentAdded={handleAttachmentAdded}
      handleAttachmentRemoved={handleAttachmentRemoved}
    />
  );
};

AttachmentsList.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  karkunId: PropTypes.string,
};

export default AttachmentsList;
