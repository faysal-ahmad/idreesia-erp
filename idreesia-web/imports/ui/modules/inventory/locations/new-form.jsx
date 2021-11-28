import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    createLocation: PropTypes.func,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.locationsPath(physicalStoreId));
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, parentId, description }) => {
    const { physicalStoreId, createLocation, history } = this.props;
    createLocation({
      variables: { name, physicalStoreId, parentId, description },
    })
      .then(() => {
        history.push(paths.locationsPath(physicalStoreId));
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { locationsLoading, locationsByPhysicalStoreId } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (locationsLoading) {
      return null;
    }

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the location."
        />
        <TreeSelectField
          data={locationsByPhysicalStoreId}
          fieldName="parentId"
          fieldLabel="Parent Location"
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

const formMutation = gql`
  mutation createLocation(
    $name: String!
    $physicalStoreId: String!
    $parentId: String
    $description: String
  ) {
    createLocation(
      name: $name
      physicalStoreId: $physicalStoreId
      parentId: $parentId
      description: $description
    ) {
      _id
      name
      parentId
      description
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(formMutation, {
    name: 'createLocation',
    options: {
      refetchQueries: ['locationsByPhysicalStoreId'],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Locations, New`;
    }
    return `Inventory, Setup, Locations, New`;
  })
)(NewForm);
