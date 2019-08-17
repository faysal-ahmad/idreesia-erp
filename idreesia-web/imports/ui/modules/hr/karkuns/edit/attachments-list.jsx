import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { message } from "antd";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { AttachmentsList as AttachmentsListControl } from "/imports/ui/modules/helpers/controls";

class AttachmentsList extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    addKarkunAttachment: PropTypes.func,
    removeKarkunAttachment: PropTypes.func,
  };

  handleAttachmentAdded = attachmentId => {
    const { addKarkunAttachment, karkunById } = this.props;
    addKarkunAttachment({
      variables: {
        _id: karkunById._id,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = attachmentId => {
    const { removeKarkunAttachment, karkunById } = this.props;
    removeKarkunAttachment({
      variables: {
        _id: karkunById._id,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { karkunById, loading } = this.props;
    if (loading) return null;

    return (
      <AttachmentsListControl
        attachments={karkunById.attachments}
        handleAttachmentAdded={this.handleAttachmentAdded}
        handleAttachmentRemoved={this.handleAttachmentRemoved}
      />
    );
  }
}

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
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
  mutation addKarkunAttachment($_id: String!, $attachmentId: String!) {
    addKarkunAttachment(_id: $_id, attachmentId: $attachmentId) {
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
  mutation removeKarkunAttachment($_id: String!, $attachmentId: String!) {
    removeKarkunAttachment(_id: $_id, attachmentId: $attachmentId) {
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
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  graphql(addAttachmentMutation, {
    name: "addKarkunAttachment",
  }),
  graphql(removeAttachmentMutation, {
    name: "removeKarkunAttachment",
  })
)(AttachmentsList);
