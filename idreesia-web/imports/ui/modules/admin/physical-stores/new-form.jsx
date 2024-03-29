import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
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
    createPhysicalStore: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresPath);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = fieldsValue => {
    const { createPhysicalStore, history } = this.props;
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
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the physical store."
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          required={false}
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
  graphql(formMutation, {
    name: 'createPhysicalStore',
    options: {
      refetchQueries: ['allPhysicalStores', 'allAccessiblePhysicalStores'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'New'])
)(NewForm);
