import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
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
    form: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    createVendor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, physicalStoreId, createVendor, history } = this.props;
    form.validateFields(
      (err, { name, contactPerson, contactNumber, address, notes }) => {
        if (err) return;

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
      }
    );
  };

  render() {
    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the vendor."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="contactPerson"
          fieldLabel="Contact Person"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="contactNumber"
          fieldLabel="Contact Number"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
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
  Form.create(),
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
