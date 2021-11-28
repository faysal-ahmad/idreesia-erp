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
import { AuditInfo } from '/imports/ui/modules/common';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    loading: PropTypes.bool,
    locationById: PropTypes.object,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    updateLocation: PropTypes.func,
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
    const {
      history,
      physicalStoreId,
      locationById,
      updateLocation,
    } = this.props;

    updateLocation({
      variables: {
        _id: locationById._id,
        name,
        physicalStoreId,
        parentId: parentId || null,
        description,
      },
    })
      .then(() => {
        history.push(paths.locationsPath(physicalStoreId));
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const {
      loading,
      locationsLoading,
      locationById,
      locationsByPhysicalStoreId,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading || locationsLoading) return null;

    return (
      <>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={locationById.name}
            required
            requiredMessage="Please input a name for the location."
          />
          <TreeSelectField
            data={locationsByPhysicalStoreId}
            skipValue={locationById._id}
            fieldName="parentId"
            fieldLabel="Parent Location"
            initialValue={locationById.parentId}
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={locationById.description}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={locationById} />
      </>
    );
  }
}

const formQuery = gql`
  query locationById($_id: String!) {
    locationById(_id: $_id) {
      _id
      name
      parentId
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateLocation(
    $_id: String!
    $name: String!
    $parentId: String
    $description: String
  ) {
    updateLocation(
      _id: $_id
      name: $name
      parentId: $parentId
      description: $description
    ) {
      _id
      name
      parentId
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(formMutation, {
    name: 'updateLocation',
    options: {
      refetchQueries: ['locationsByPhysicalStoreId'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { locationId } = match.params;
      return { variables: { _id: locationId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Locations, Edit`;
    }
    return `Inventory, Setup, Locations, Edit`;
  })
)(EditForm);
