import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { flowRight } from 'lodash';
import { message } from 'antd';

import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';
import {
  ADD_PURCHASE_FORM_ATTACHMENT,
  REMOVE_PURCHASE_FORM_ATTACHMENT,
} from '../gql';

const AttachmentsListControlComponent = AttachmentsListControl as any;

interface Attachment {
  _id: string;
  name: string;
}

interface PurchaseForm {
  _id: string;
  attachments?: Attachment[];
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface AttachmentsListProps {
  physicalStoreId?: string;
  purchaseFormId?: string;
  purchaseFormById: PurchaseForm;
  addPurchaseFormAttachment: MutateFunction;
  removePurchaseFormAttachment: MutateFunction;
}

class AttachmentsList extends Component<AttachmentsListProps> {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    purchaseFormId: PropTypes.string,
    purchaseFormById: PropTypes.object,

    addPurchaseFormAttachment: PropTypes.func,
    removePurchaseFormAttachment: PropTypes.func,
  };

  handleAttachmentAdded = (attachmentId: string) => {
    const { addPurchaseFormAttachment, physicalStoreId, purchaseFormById } =
      this.props;
    addPurchaseFormAttachment({
      variables: {
        _id: purchaseFormById._id,
        physicalStoreId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = (attachmentId: string) => {
    const { removePurchaseFormAttachment, physicalStoreId, purchaseFormById } =
      this.props;
    removePurchaseFormAttachment({
      variables: {
        _id: purchaseFormById._id,
        physicalStoreId,
        attachmentId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { purchaseFormById } = this.props;

    return (
      <AttachmentsListControlComponent
        canUploadDocument
        canEditAttachments
        attachments={purchaseFormById.attachments}
        handleAttachmentAdded={this.handleAttachmentAdded}
        handleAttachmentRemoved={this.handleAttachmentRemoved}
      />
    );
  }
}

export default flowRight(
  withMutation(ADD_PURCHASE_FORM_ATTACHMENT, {
    name: 'addPurchaseFormAttachment',
  }),
  withMutation(REMOVE_PURCHASE_FORM_ATTACHMENT, {
    name: 'removePurchaseFormAttachment',
  })
)(AttachmentsList as any);
