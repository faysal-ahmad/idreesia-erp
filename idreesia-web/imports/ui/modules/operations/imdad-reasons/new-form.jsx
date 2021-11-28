import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_IMDAD_REASON, ALL_IMDAD_REASONS } from './gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createImdadReason: PropTypes.func,
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

  handleFinish = ({ name, description }) => {
    const { createImdadReason, history } = this.props;
    createImdadReason({
      variables: {
        name,
        description,
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
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Imdad Reason"
          required
          requiredMessage="Please input a name for the imdad reason."
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  graphql(CREATE_IMDAD_REASON, {
    name: 'createImdadReason',
    options: {
      refetchQueries: [{ query: ALL_IMDAD_REASONS }],
    },
  }),
  WithBreadcrumbs(['Accounts', 'Imdad Reasons', 'New'])
)(NewForm);
