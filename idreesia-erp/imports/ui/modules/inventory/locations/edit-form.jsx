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
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    locationById: PropTypes.object,
    updateLocation: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.locationsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, locationById, updateLocation } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      updateLocation({
        variables: {
          _id: locationById._id,
          name,
          description,
        },
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
    const { loading, locationById } = this.props;
    if (loading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={locationById.name}
          required
          requiredMessage="Please input a name for the location."
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
    );
  }
}

const formQuery = gql`
  query locationById($_id: String!) {
    locationById(_id: $_id) {
      _id
      name
      description
    }
  }
`;

const formMutation = gql`
  mutation updateLocation($_id: String!, $name: String!, $description: String) {
    updateLocation(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "updateLocation",
    options: {
      refetchQueries: ["allLocations"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { locationId } = match.params;
      return { variables: { _id: locationId } };
    },
  }),
  WithBreadcrumbs(["Inventory", "Setup", "Locations", "Edit"])
)(EditForm);