import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";
import {
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    physicalStoreId: PropTypes.string,
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

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the location."
          getFieldDecorator={getFieldDecorator}
        />
        <TreeSelectField
          data={locationsByPhysicalStoreId}
          fieldName="parentId"
          fieldLabel="Parent Location"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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

export default compose(
  Form.create(),
  WithPhysicalStoreId(),
  WithLocationsByPhysicalStore(),
  graphql(formMutation, {
    name: "createLocation",
    options: {
      refetchQueries: ["locationsByPhysicalStoreId"],
    },
  }),
  WithBreadcrumbs(["Inventory", "Setup", "Locations", "New"])
)(NewForm);
