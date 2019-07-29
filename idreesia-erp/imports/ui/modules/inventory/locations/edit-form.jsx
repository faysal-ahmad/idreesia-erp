import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithDynamicBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";
import { RecordInfo } from "/imports/ui/modules/helpers/controls";

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    loading: PropTypes.bool,
    locationById: PropTypes.object,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    updateLocation: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.locationsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      physicalStoreId,
      locationById,
      updateLocation,
    } = this.props;
    form.validateFields((err, { name, parentId, description }) => {
      if (err) return;

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
    });
  };

  render() {
    const {
      loading,
      locationsLoading,
      locationById,
      locationsByPhysicalStoreId,
    } = this.props;
    if (loading || locationsLoading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={locationById.name}
            required
            requiredMessage="Please input a name for the location."
            getFieldDecorator={getFieldDecorator}
          />
          <TreeSelectField
            data={locationsByPhysicalStoreId}
            skipValue={locationById._id}
            fieldName="parentId"
            fieldLabel="Parent Location"
            initialValue={locationById.parentId}
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={locationById.description}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={locationById} />
      </Fragment>
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

export default compose(
  Form.create(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(formMutation, {
    name: "updateLocation",
    options: {
      refetchQueries: ["locationsByPhysicalStoreId"],
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
