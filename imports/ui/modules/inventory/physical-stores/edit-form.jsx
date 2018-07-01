import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    physicalStoreById: PropTypes.object,
    updatePhysicalStore: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, physicalStoreById, updatePhysicalStore } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      updatePhysicalStore({
        variables: {
          id: physicalStoreById._id,
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
    const { loading, physicalStoreById } = this.props;
    if (loading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={physicalStoreById.name}
          required
          requiredMessage="Please input a name for the physical store."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={physicalStoreById.address}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query physicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
      address
    }
  }
`;

const formMutation = gql`
  mutation updatePhysicalStore($id: String!, $name: String!, $address: String!) {
    updatePhysicalStore(id: $id, name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: 'updatePhysicalStore',
    options: {
      refetchQueries: ['allPhysicalStores', 'allAccessiblePhysicalStores'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { physicalStoreId } = match.params;
      return { variables: { id: physicalStoreId } };
    },
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Physical Stores', 'Edit'])
)(EditForm);
