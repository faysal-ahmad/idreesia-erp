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
    form: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    createLocation: PropTypes.func,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.locationsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, physicalStoreId, createLocation, history } = this.props;
    form.validateFields((err, { name, parentId, description }) => {
      if (err) return;

      createLocation({
        variables: { name, physicalStoreId, parentId, description },
      })
        .then(() => {
          history.push(paths.locationsPath(physicalStoreId));
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { locationsLoading, locationsByPhysicalStoreId } = this.props;
    if (locationsLoading) {
      return null;
    }

    const { isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
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
