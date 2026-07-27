import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { flowRight } from 'lodash';
import { message } from 'antd';

import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';
import {
  ADD_ISSUANCE_FORM_ATTACHMENT,
  REMOVE_ISSUANCE_FORM_ATTACHMENT,
} from '../gql';

const AttachmentsListControlComponent = AttachmentsListControl as any;
interface Attachment { _id: string; name: string; }
interface IssuanceForm { _id: string; attachments?: Attachment[]; }
interface MutateFunction { (options: { variables: Record<string, unknown> }): Promise<unknown>; }
interface AttachmentsListProps {
  physicalStoreId?: string;
  issuanceFormById: IssuanceForm;
  addIssuanceFormAttachment: MutateFunction;
  removeIssuanceFormAttachment: MutateFunction;
}

class AttachmentsList extends Component<AttachmentsListProps> {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    issuanceFormById: PropTypes.object,

    addIssuanceFormAttachment: PropTypes.func,
    removeIssuanceFormAttachment: PropTypes.func,
  };

  handleAttachmentAdded = (attachmentId: string) => {
    const { addIssuanceFormAttachment, physicalStoreId, issuanceFormById } =
      this.props;
    addIssuanceFormAttachment({
      variables: {
        _id: issuanceFormById._id,
        physicalStoreId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = (attachmentId: string) => {
    const { removeIssuanceFormAttachment, physicalStoreId, issuanceFormById } =
      this.props;
    removeIssuanceFormAttachment({
      variables: {
        _id: issuanceFormById._id,
        physicalStoreId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { issuanceFormById } = this.props;

    return (
      <AttachmentsListControlComponent
        canEditAttachments
        canUploadDocument
        attachments={issuanceFormById.attachments}
        handleAttachmentAdded={this.handleAttachmentAdded}
        handleAttachmentRemoved={this.handleAttachmentRemoved}
      />
    );
  }
}

export default flowRight(
  withMutation(ADD_ISSUANCE_FORM_ATTACHMENT, {
    name: 'addIssuanceFormAttachment',
  }),
  withMutation(REMOVE_ISSUANCE_FORM_ATTACHMENT, {
    name: 'removeIssuanceFormAttachment',
  })
)(AttachmentsList as any);
