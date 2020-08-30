import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/controls';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  SHARED_RESIDENCE_BY_ID,
  ADD_SHARED_RESIDENCE_ATTACHMENT,
  REMOVE_SHARED_RESIDENCE_ATTACHMENT,
} from '../gql';

class AttachmentsList extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    sharedResidenceId: PropTypes.string,
    sharedResidenceById: PropTypes.object,
    addSharedResidenceAttachment: PropTypes.func,
    removeSharedResidenceAttachment: PropTypes.func,
  };

  handleAttachmentAdded = attachmentId => {
    const { addSharedResidenceAttachment, sharedResidenceId } = this.props;
    addSharedResidenceAttachment({
      variables: {
        _id: sharedResidenceId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = attachmentId => {
    const { removeSharedResidenceAttachment, sharedResidenceId } = this.props;
    removeSharedResidenceAttachment({
      variables: {
        _id: sharedResidenceId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { sharedResidenceById, loading } = this.props;
    if (loading) return null;

    return (
      <AttachmentsListControl
        attachments={sharedResidenceById.attachments}
        handleAttachmentAdded={this.handleAttachmentAdded}
        handleAttachmentRemoved={this.handleAttachmentRemoved}
      />
    );
  }
}

export default flowRight(
  graphql(SHARED_RESIDENCE_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { sharedResidenceId } = match.params;
      return { variables: { _id: sharedResidenceId } };
    },
  }),
  graphql(ADD_SHARED_RESIDENCE_ATTACHMENT, {
    name: 'addSharedResidenceAttachment',
  }),
  graphql(REMOVE_SHARED_RESIDENCE_ATTACHMENT, {
    name: 'removeSharedResidenceAttachment',
  })
)(AttachmentsList);
