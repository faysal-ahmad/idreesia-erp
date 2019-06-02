import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";
import {
  InputCnicField,
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createVisitor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createVisitor, history } = this.props;
    form.validateFields(
      (
        err,
        {
          firstName,
          lastName,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          address,
          city,
          country,
        }
      ) => {
        if (err) return;

        createVisitor({
          variables: {
            firstName,
            lastName,
            cnicNumber,
            contactNumber1,
            contactNumber2,
            address,
            city,
            country,
          },
        })
          .then(({ data: { createVisitor: newVisitor } }) => {
            history.push(`${paths.visitorRegistrationPath}/${newVisitor._id}`);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="firstName"
          fieldLabel="First Name"
          required
          requiredMessage="Please input the first name for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="lastName"
          fieldLabel="Last Name"
          required
          requiredMessage="Please input the last name for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber1"
          fieldLabel="Contact Number 1"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Contact Number 2"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          required={false}
          requiredMessage="Please input the address for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="city"
          fieldLabel="City"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="country"
          fieldLabel="Country"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createVisitor(
    $firstName: String!
    $lastName: String!
    $cnicNumber: String
    $contactNumber1: String
    $contactNumber2: String
    $address: String
    $city: String
    $country: String
  ) {
    createVisitor(
      firstName: $firstName
      lastName: $lastName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      address: $address
      city: $city
      country: $country
    ) {
      _id
      firstName
      lastName
      cnicNumber
      contactNumber1
      contactNumber2
      address
      city
      country
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "createVisitor",
    options: {
      refetchQueries: ["pagedVisitors"],
    },
  }),
  WithBreadcrumbs(["Security", "Visitor Registration", "New"])
)(NewForm);
