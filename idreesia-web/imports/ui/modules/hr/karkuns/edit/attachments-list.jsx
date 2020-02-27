import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { message } from '/imports/ui/controls';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  HR_KARKUN_BY_ID,
  ADD_HR_KARKUN_ATTACHMENT,
  REMOVE_HR_KARKUN_ATTACHMENT,
} from '../gql';

class AttachmentsList extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    hrKarkunById: PropTypes.object,
    addHrKarkunAttachment: PropTypes.func,
    removeHrKarkunAttachment: PropTypes.func,
  };

  handleAttachmentAdded = attachmentId => {
    const { addHrKarkunAttachment, karkunId } = this.props;
    addHrKarkunAttachment({
      variables: {
        _id: karkunId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = attachmentId => {
    const { removeHrKarkunAttachment, karkunId } = this.props;
    removeHrKarkunAttachment({
      variables: {
        _id: karkunId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { hrKarkunById, loading } = this.props;
    if (loading) return null;

    return (
      <AttachmentsListControl
        attachments={hrKarkunById.attachments}
        handleAttachmentAdded={this.handleAttachmentAdded}
        handleAttachmentRemoved={this.handleAttachmentRemoved}
      />
    );
  }
}

export default flowRight(
  graphql(HR_KARKUN_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  graphql(ADD_HR_KARKUN_ATTACHMENT, {
    name: 'addHrKarkunAttachment',
  }),
  graphql(REMOVE_HR_KARKUN_ATTACHMENT, {
    name: 'removeHrKarkunAttachment',
  })
)(AttachmentsList);
