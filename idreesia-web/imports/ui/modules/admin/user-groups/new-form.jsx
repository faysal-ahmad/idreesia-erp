import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createUserGroup: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createUserGroup, history } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      createUserGroup({
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
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Group name"
          getFieldDecorator={getFieldDecorator}
          required
          requiredMessage="Please input a name for the group."
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createUserGroup($name: String!, $description: String) {
    createUserGroup(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createUserGroup',
    options: {
      refetchQueries: ['pagedUserGroups'],
    },
  }),
  WithBreadcrumbs(['Admin', 'User Groups', 'New'])
)(NewForm);
