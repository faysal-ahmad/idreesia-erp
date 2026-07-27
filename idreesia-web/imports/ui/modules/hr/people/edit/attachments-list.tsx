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

const AttachmentsListControlComponent = AttachmentsListControl as any;
type AnyRecord = Record<string, any>;
interface MatchLike { params: { karkunId: string; }; }
interface QueryData { hrKarkunById?: AnyRecord | null; }
interface Props { match: MatchLike; karkunId?: string | null; }

const AttachmentsList = ({ match, karkunId }: Props) => {
  const { data, loading } = useQuery(HR_KARKUN_BY_ID as any, {
    variables: { _id: match.params.karkunId },
  });
  const [addHrKarkunAttachment] = useMutation(ADD_HR_KARKUN_ATTACHMENT as any);
  const [removeHrKarkunAttachment] = useMutation(REMOVE_HR_KARKUN_ATTACHMENT as any);
  const { hrKarkunById } = (data ?? {}) as QueryData;

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
    <AttachmentsListControlComponent
      canUploadDocument
      canEditAttachments
      attachments={hrKarkunById?.attachments ?? []}
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
