import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";
import {
  BarcodeField,
  InputCnicField,
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    updateKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.karkunsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, karkunById, updateKarkun } = this.props;
    form.validateFields(
      (
        err,
        {
          firstName,
          lastName,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          address,
          city,
          country,
          barcode,
        }
      ) => {
        if (err) return;

        updateKarkun({
          variables: {
            _id: karkunById._id,
            firstName,
            lastName,
            cnicNumber,
            contactNumber1,
            contactNumber2,
            emailAddress,
            address,
            city,
            country,
            barcode,
          },
        })
          .then(() => {
            history.push(paths.karkunsPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { loading, karkunById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="firstName"
          fieldLabel="First Name"
          initialValue={karkunById.firstName}
          required
          requiredMessage="Please input the first name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="lastName"
          fieldLabel="Last Name"
          initialValue={karkunById.lastName}
          required
          requiredMessage="Please input the last name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={karkunById.cnicNumber}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber1"
          fieldLabel="Contact No. 1"
          initialValue={karkunById.contactNumber1}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Contact No. 2"
          initialValue={karkunById.contactNumber2}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="emailAddress"
          fieldLabel="Email"
          initialValue={karkunById.emailAddress}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={karkunById.address}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="city"
          fieldLabel="City"
          initialValue={karkunById.city}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="country"
          fieldLabel="Country"
          initialValue={karkunById.country}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <BarcodeField
          fieldName="barcode"
          fieldLabel="Barcode"
          initialValue={karkunById.barcode}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      firstName
      lastName
      cnicNumber
      contactNumber1
      contactNumber2
      emailAddress
      address
      city
      country
      barcode
    }
  }
`;

const formMutation = gql`
  mutation updateKarkun(
    $_id: String!
    $firstName: String!
    $lastName: String!
    $cnicNumber: String
    $contactNumber1: String
    $contactNumber2: String
    $emailAddress: String
    $address: String
    $city: String
    $country: String
    $barcode: String
  ) {
    updateKarkun(
      _id: $_id
      firstName: $firstName
      lastName: $lastName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      emailAddress: $emailAddress
      address: $address
      city: $city
      country: $country
      barcode: $barcode
    ) {
      _id
      firstName
      lastName
      cnicNumber
      contactNumber1
      contactNumber2
      emailAddress
      address
      city
      country
      barcode
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "updateKarkun",
    options: {
      refetchQueries: ["pagedKarkuns"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(GeneralInfo);
