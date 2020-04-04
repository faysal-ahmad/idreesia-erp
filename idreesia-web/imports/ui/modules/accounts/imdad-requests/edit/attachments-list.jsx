import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flowRight } from 'lodash';
import { graphql } from 'react-apollo';

import { message } from '/imports/ui/controls';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

import {
  ACCOUNTS_IMDAD_REQUEST_BY_ID,
  ADD_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT,
  REMOVE_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT,
} from '../gql';

class AttachmentsList extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    formDataLoading: PropTypes.bool,
    requestId: PropTypes.string,
    accountsImdadRequestById: PropTypes.object,
    addAccountsImdadRequestAttachment: PropTypes.func,
    removeAccountsImdadRequestAttachment: PropTypes.func,
  };

  handleAttachmentAdded = attachmentId => {
    const { addAccountsImdadRequestAttachment, requestId } = this.props;
    addAccountsImdadRequestAttachment({
      variables: {
        _id: requestId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleAttachmentRemoved = attachmentId => {
    const { removeAccountsImdadRequestAttachment, requestId } = this.props;
    removeAccountsImdadRequestAttachment({
      variables: {
        _id: requestId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { accountsImdadRequestById, formDataLoading } = this.props;
    if (formDataLoading) return null;

    return (
      <AttachmentsListControl
        attachments={accountsImdadRequestById.attachments}
        handleAttachmentAdded={this.handleAttachmentAdded}
        handleAttachmentRemoved={this.handleAttachmentRemoved}
      />
    );
  }
}

export default flowRight(
  graphql(ACCOUNTS_IMDAD_REQUEST_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ requestId }) => ({ variables: { _id: requestId } }),
  }),
  graphql(ADD_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT, {
    name: 'addAccountsImdadRequestAttachment',
  }),
  graphql(REMOVE_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT, {
    name: 'removeAccountsImdadRequestAttachment',
  })
)(AttachmentsList);
