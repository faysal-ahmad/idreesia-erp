import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
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
    form: PropTypes.object,
    createImdadReason: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createImdadReason, history } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

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
    });
  };

  render() {
    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Imdad Reason"
          required
          requiredMessage="Please input a name for the imdad reason."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          getFieldDecorator={getFieldDecorator}
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
  Form.create(),
  graphql(CREATE_IMDAD_REASON, {
    name: 'createImdadReason',
    options: {
      refetchQueries: [{ query: ALL_IMDAD_REASONS }],
    },
  }),
  WithBreadcrumbs(['Accounts', 'Imdad Reasons', 'New'])
)(NewForm);
