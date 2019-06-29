import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";
import {
  InputCnicField,
  InputTextField,
  InputTextAreaField,
  MonthField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    visitorId: PropTypes.string,
    visitorById: PropTypes.object,
    updateVisitor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, visitorById, updateVisitor } = this.props;
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

        updateVisitor({
          variables: {
            _id: visitorById._id,
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
          .then(() => {
            history.push(paths.visitorRegistrationPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { loading, visitorById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={visitorById.name}
          required
          requiredMessage="Please input the first name for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          initialValue={visitorById.parentName}
          required
          requiredMessage="Please input the parent name for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={visitorById.cnicNumber}
          required
          requiredMessage="Please input the CNIC for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <MonthField
          fieldName="ehadDate"
          fieldLabel="Ehad Date"
          initialValue={moment(Number(visitorById.ehadDate))}
          allowClear={false}
          format="MMM, YYYY"
          required
          requiredMessage="Please specify the Ehad date for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          initialValue={visitorById.referenceName}
          required
          requiredMessage="Please input the referene name for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber1"
          fieldLabel="Contact No. 1"
          initialValue={visitorById.contactNumber1}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Contact No. 2"
          initialValue={visitorById.contactNumber2}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={visitorById.address}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="city"
          fieldLabel="City"
          initialValue={visitorById.city}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="country"
          fieldLabel="Country"
          initialValue={visitorById.country}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query visitorById($_id: String!) {
    visitorById(_id: $_id) {
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

const formMutation = gql`
  mutation updateVisitor(
    $_id: String!
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
    updateVisitor(
      _id: $_id
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
    name: "updateVisitor",
    options: {
      refetchQueries: ["pagedVisitors"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(GeneralInfo);
