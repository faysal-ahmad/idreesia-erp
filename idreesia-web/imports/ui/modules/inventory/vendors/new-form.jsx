import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    createVendor: PropTypes.func,
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

  handleFinish = ({ name, contactPerson, contactNumber, address, notes }) => {
    const { physicalStoreId, createVendor, history } = this.props;
    createVendor({
      variables: {
        name,
        physicalStoreId,
        contactPerson,
        contactNumber,
        address,
        notes,
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
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the vendor."
        />
        <InputTextField
          fieldName="contactPerson"
          fieldLabel="Contact Person"
        />
        <InputTextField
          fieldName="contactNumber"
          fieldLabel="Contact Number"
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
        />
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
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
  mutation createVendor(
    $name: String!
    $physicalStoreId: String!
    $contactPerson: String
    $contactNumber: String
    $address: String
    $notes: String
  ) {
    createVendor(
      name: $name
      physicalStoreId: $physicalStoreId
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      notes: $notes
    ) {
      _id
      name
      physicalStoreId
      contactPerson
      contactNumber
      address
      notes
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  graphql(formMutation, {
    name: 'createVendor',
    options: {
      refetchQueries: ['vendorsByPhysicalStoreId'],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Vendors, New`;
    }
    return `Inventory, Setup, Vendors, New`;
  })
)(NewForm);
