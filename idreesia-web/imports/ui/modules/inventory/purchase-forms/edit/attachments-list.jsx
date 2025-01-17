import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { message } from "antd";
import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";
import { AttachmentsList as AttachmentsListControl } from "/imports/ui/modules/helpers/controls";

class AttachmentsList extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    physicalStoreId: PropTypes.string,
    purchaseFormId: PropTypes.string,
    formDataLoading: PropTypes.bool,
    purchaseFormById: PropTypes.object,
    addPurchaseFormAttachment: PropTypes.func,
    removePurchaseFormAttachment: PropTypes.func,
  };

  handleAttachmentAdded = attachmentId => {
    const { addPurchaseFormAttachment, physicalStoreId, purchaseFormById } = this.props;
    addPurchaseFormAttachment({
      variables: {
        _id: purchaseFormById._id,
        physicalStoreId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = attachmentId => {
    const {
      removePurchaseFormAttachment,
      physicalStoreId,
      purchaseFormById,
    } = this.props;
    removePurchaseFormAttachment({
      variables: {
        _id: purchaseFormById._id,
        physicalStoreId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { purchaseFormById, formDataLoading } = this.props;
    if (formDataLoading) return null;

    return (
      <AttachmentsListControl
        canUploadDocument
        canEditAttachments
        attachments={purchaseFormById.attachments}
        handleAttachmentAdded={this.handleAttachmentAdded}
        handleAttachmentRemoved={this.handleAttachmentRemoved}
      />
    );
  }
}

const formQuery = gql`
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
      _id
      attachments {
        _id
        name
        description
        mimeType
      }
    }
  }
`;

const addPurchaseAttachmentMutation = gql`
  mutation addPurchaseFormAttachment(
    $_id: String!
    $physicalStoreId: String!
    $attachmentId: String!
  ) {
    addPurchaseFormAttachment(
      _id: $_id
      physicalStoreId: $physicalStoreId
      attachmentId: $attachmentId
    ) {
      _id
      attachments {
        _id
        name
        description
        mimeType
      }
    }
  }
`;

const removePurchaseAttachmentMutation = gql`
  mutation removePurchaseFormAttachment(
    $_id: String!
    $physicalStoreId: String!
    $attachmentId: String!
  ) {
    removePurchaseFormAttachment(
      _id: $_id
      physicalStoreId: $physicalStoreId
      attachmentId: $attachmentId
    ) {
      _id
      attachments {
        _id
        name
        description
        mimeType
      }
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ purchaseFormId }) => ({ variables: { _id: purchaseFormId } }),
  }),
  graphql(addPurchaseAttachmentMutation, {
    name: "addPurchaseFormAttachment",
  }),
  graphql(removePurchaseAttachmentMutation, {
    name: "removePurchaseFormAttachment",
  })
)(AttachmentsList);
