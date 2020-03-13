import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
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
    createPhysicalStore: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createPhysicalStore, history } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      createPhysicalStore({
        variables: {
          name: fieldsValue.name,
          address: fieldsValue.address,
        },
      })
        .then(() => {
          history.push(paths.physicalStoresPath);
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
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the physical store."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          required={false}
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

const formMutation = gql`
  mutation createPhysicalStore($name: String!, $address: String) {
    createPhysicalStore(name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createPhysicalStore',
    options: {
      refetchQueries: ['allPhysicalStores', 'allAccessiblePhysicalStores'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'New'])
)(NewForm);
