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
    issuanceFormId: PropTypes.string,
    formDataLoading: PropTypes.bool,
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
    const { issuanceFormById, formDataLoading } = this.props;
    if (formDataLoading) return null;

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

const formQuery = gql`
  query issuanceFormById($_id: String!) {
    issuanceFormById(_id: $_id) {
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

const addIssuanceAttachmentMutation = gql`
  mutation addIssuanceFormAttachment(
    $_id: String!
    $physicalStoreId: String!
    $attachmentId: String!
  ) {
    addIssuanceFormAttachment(
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

const removeIssuanceAttachmentMutation = gql`
  mutation removeIssuanceFormAttachment(
    $_id: String!
    $physicalStoreId: String!
    $attachmentId: String!
  ) {
    removeIssuanceFormAttachment(
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
    options: ({ issuanceFormId }) => ({ variables: { _id: issuanceFormId } }),
  }),
  graphql(addIssuanceAttachmentMutation, {
    name: "addIssuanceFormAttachment",
  }),
  graphql(removeIssuanceAttachmentMutation, {
    name: "removeIssuanceFormAttachment",
  })
)(AttachmentsList);
