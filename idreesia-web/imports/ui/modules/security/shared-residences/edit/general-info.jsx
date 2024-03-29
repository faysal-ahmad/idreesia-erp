import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import { SHARED_RESIDENCE_BY_ID, UPDATE_SHARED_RESIDENCE } from '../gql';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    sharedResidenceId: PropTypes.string,
    loading: PropTypes.bool,
    sharedResidenceById: PropTypes.object,
    updateSharedResidence: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, address }) => {
    const {
      history,
      sharedResidenceById,
      updateSharedResidence,
    } = this.props;
    updateSharedResidence({
      variables: {
        _id: sharedResidenceById._id,
        name,
        address,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { loading, sharedResidenceById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            required
            requiredMessage="Please input name for the residence."
            initialValue={sharedResidenceById.name}
          />
          <InputTextAreaField
            fieldName="address"
            fieldLabel="Address"
            initialValue={sharedResidenceById.address}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={sharedResidenceById} />
      </>
    );
  }
}

export default flowRight(
  graphql(UPDATE_SHARED_RESIDENCE, {
    name: 'updateSharedResidence',
    options: {
      refetchQueries: ['pagedSharedResidences'],
    },
  }),
  graphql(SHARED_RESIDENCE_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ sharedResidenceId }) => ({
      variables: { _id: sharedResidenceId },
    }),
  })
)(EditForm);
