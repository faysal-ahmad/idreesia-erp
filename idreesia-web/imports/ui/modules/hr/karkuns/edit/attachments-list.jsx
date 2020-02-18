import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { message } from '/imports/ui/controls';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  KARKUN_BY_ID,
  ADD_KARKUN_ATTACHMENT,
  REMOVE_KARKUN_ATTACHMENT,
} from '../gql';

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

export default flowRight(
  graphql(KARKUN_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  graphql(ADD_KARKUN_ATTACHMENT, {
    name: 'addKarkunAttachment',
  }),
  graphql(REMOVE_KARKUN_ATTACHMENT, {
    name: 'removeKarkunAttachment',
  })
)(AttachmentsList);
