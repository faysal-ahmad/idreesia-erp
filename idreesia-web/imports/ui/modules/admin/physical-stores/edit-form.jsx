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

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    physicalStoreById: PropTypes.object,
    updatePhysicalStore: PropTypes.func,
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
    const {
      history,
      physicalStoreById,
      updatePhysicalStore,
    } = this.props;
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
  };

  render() {
    const { loading, physicalStoreById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={physicalStoreById.name}
          required
          requiredMessage="Please input a name for the physical store."
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={physicalStoreById.address}
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
  mutation updatePhysicalStore(
    $id: String!
    $name: String!
    $address: String!
  ) {
    updatePhysicalStore(id: $id, name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

export default flowRight(
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
  WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'Edit'])
)(EditForm);
