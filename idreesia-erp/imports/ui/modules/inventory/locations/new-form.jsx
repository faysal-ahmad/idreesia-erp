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
import { WithLocations } from "/imports/ui/modules/inventory/common/composers";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createLocation: PropTypes.func,

    locationsListLoading: PropTypes.bool,
    allLocations: PropTypes.array,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.locationsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createLocation, history } = this.props;
    form.validateFields((err, { name, parentId, description }) => {
      if (err) return;

      createLocation({
        variables: { name, parentId, description },
      })
        .then(() => {
          history.push(paths.locationsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { locationsListLoading, allLocations } = this.props;
    if (locationsListLoading) {
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
          data={allLocations}
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
    $parentId: String
    $description: String
  ) {
    createLocation(
      name: $name
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
  WithLocations(),
  graphql(formMutation, {
    name: "createLocation",
    options: {
      refetchQueries: ["allLocations"],
    },
  }),
  WithBreadcrumbs(["Inventory", "Setup", "Locations", "New"])
)(NewForm);
