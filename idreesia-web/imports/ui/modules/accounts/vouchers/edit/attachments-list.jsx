import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { flowRight } from "lodash";
import { graphql } from "react-apollo";

import { message } from "/imports/ui/controls";
import { WithCompanyId } from "/imports/ui/modules/accounts/common/composers";
import { AttachmentsList as AttachmentsListControl } from "/imports/ui/modules/helpers/controls";

class AttachmentsList extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    companyId: PropTypes.string,
    formDataLoading: PropTypes.bool,
    voucherId: PropTypes.string,
    voucherById: PropTypes.object,
    addVoucherAttachment: PropTypes.func,
    removeVoucherAttachment: PropTypes.func,
  };

  handleAttachmentAdded = attachmentId => {
    const { addVoucherAttachment, companyId, voucherById } = this.props;
    addVoucherAttachment({
      variables: {
        _id: voucherById._id,
        companyId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = attachmentId => {
    const { removeVoucherAttachment, companyId, voucherById } = this.props;
    removeVoucherAttachment({
      variables: {
        _id: voucherById._id,
        companyId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { voucherById, formDataLoading } = this.props;
    if (formDataLoading) return null;

    return (
      <AttachmentsListControl
        attachments={voucherById.attachments}
        handleAttachmentAdded={this.handleAttachmentAdded}
        handleAttachmentRemoved={this.handleAttachmentRemoved}
      />
    );
  }
}

const formQuery = gql`
  query voucherById($_id: String!, $companyId: String!) {
    voucherById(_id: $_id, companyId: $companyId) {
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

const addAttachmentMutation = gql`
  mutation addVoucherAttachment(
    $_id: String!
    $companyId: String!
    $attachmentId: String!
  ) {
    addVoucherAttachment(
      _id: $_id
      companyId: $companyId
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

const removeAttachmentMutation = gql`
  mutation removeVoucherAttachment(
    $_id: String!
    $companyId: String!
    $attachmentId: String!
  ) {
    removeVoucherAttachment(
      _id: $_id
      companyId: $companyId
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
  WithCompanyId(),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ companyId, match }) => {
      const { voucherId } = match.params;
      return { variables: { _id: voucherId, companyId } };
    },
  }),
  graphql(addAttachmentMutation, {
    name: "addVoucherAttachment",
  }),
  graphql(removeAttachmentMutation, {
    name: "removeVoucherAttachment",
  })
)(AttachmentsList);
