import React, { Component } from "react";
import PropTypes from "prop-types";
import { Divider, Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";
import {
  InputCnicField,
  InputTextField,
  InputTextAreaField,
  MonthField,
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
          name,
          parentName,
          cnicNumber,
          ehadDate,
          referenceName,
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
            name,
            parentName,
            cnicNumber,
            ehadDate,
            referenceName,
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
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the visitor."
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

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <Divider />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          required
          requiredMessage="Please input the CNIC for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <MonthField
          fieldName="ehadDate"
          fieldLabel="Ehad Date"
          allowClear={false}
          format="MMM, YYYY"
          required
          requiredMessage="Please specify the Ehad date for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          required
          requiredMessage="Please input the reference name for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
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
    $name: String!
    $parentName: String!
    $cnicNumber: String!
    $ehadDate: String!
    $referenceName: String!
    $contactNumber1: String
    $contactNumber2: String
    $address: String
    $city: String
    $country: String
  ) {
    createVisitor(
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      ehadDate: $ehadDate
      referenceName: $referenceName
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      address: $address
      city: $city
      country: $country
    ) {
      _id
      name
      parentName
      cnicNumber
      ehadDate
      referenceName
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
