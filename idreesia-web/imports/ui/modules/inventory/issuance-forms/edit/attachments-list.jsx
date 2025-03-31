import React, { Component } from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";
import { message } from "antd";

import { AttachmentsList as AttachmentsListControl } from "/imports/ui/modules/helpers/controls";
import {
  ADD_ISSUANCE_FORM_ATTACHMENT,
  REMOVE_ISSUANCE_FORM_ATTACHMENT,
} from '../gql';

class AttachmentsList extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    issuanceFormById: PropTypes.object,

    addIssuanceFormAttachment: PropTypes.func,
    removeIssuanceFormAttachment: PropTypes.func,
  };

  handleAttachmentAdded = attachmentId => {
    const { addIssuanceFormAttachment, physicalStoreId, issuanceFormById } = this.props;
    addIssuanceFormAttachment({
      variables: {
        _id: issuanceFormById._id,
        physicalStoreId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = attachmentId => {
    const {
      removeIssuanceFormAttachment,
      physicalStoreId,
      issuanceFormById,
    } = this.props;
    removeIssuanceFormAttachment({
      variables: {
        _id: issuanceFormById._id,
        physicalStoreId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { issuanceFormById } = this.props;

    return (
      <AttachmentsListControl
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
  graphql(ADD_ISSUANCE_FORM_ATTACHMENT, {
    name: "addIssuanceFormAttachment",
  }),
  graphql(REMOVE_ISSUANCE_FORM_ATTACHMENT, {
    name: "removeIssuanceFormAttachment",
  })
)(AttachmentsList);
