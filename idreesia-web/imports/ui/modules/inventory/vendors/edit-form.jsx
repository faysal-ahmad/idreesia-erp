import React, { Component, Fragment } from 'react';
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
import { AuditInfo } from '/imports/ui/modules/common';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    loading: PropTypes.bool,
    vendorById: PropTypes.object,
    updateVendor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, vendorById, updateVendor } = this.props;
    form.validateFields(
      (err, { name, contactPerson, contactNumber, address, notes }) => {
        if (err) return;

        updateVendor({
          variables: {
            _id: vendorById._id,
            name,
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
    const { loading, vendorById } = this.props;
    if (loading) return null;

    const { isFieldsTouched } = this.props.form;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={vendorById.name}
            required
            requiredMessage="Please input a name for the vendor."
          />
          <InputTextField
            fieldName="contactPerson"
            fieldLabel="Contact Person"
            initialValue={vendorById.contactPerson}
          />
          <InputTextField
            fieldName="contactNumber"
            fieldLabel="Contact Number"
            initialValue={vendorById.contactNumber}
          />
          <InputTextAreaField
            fieldName="address"
            fieldLabel="Address"
            initialValue={vendorById.address}
          />
          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            initialValue={vendorById.notes}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={vendorById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query vendorById($_id: String!) {
    vendorById(_id: $_id) {
      _id
      physicalStoreId
      name
      contactPerson
      contactNumber
      address
      notes
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateVendor(
    $_id: String!
    $name: String!
    $contactPerson: String
    $contactNumber: String
    $address: String
    $notes: String
  ) {
    updateVendor(
      _id: $_id
      name: $name
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      notes: $notes
    ) {
      _id
      physicalStoreId
      name
      contactPerson
      contactNumber
      address
      notes
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  Form.create(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  graphql(formMutation, {
    name: 'updateVendor',
    options: {
      refetchQueries: ['vendorsByPhysicalStoreId'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { vendorId } = match.params;
      return { variables: { _id: vendorId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Vendors, Edit`;
    }
    return `Inventory, Setup, Vendors, Edit`;
  })
)(EditForm);
