import React, { Component } from "react";
import PropTypes from "prop-types";
import { Divider, Form, message } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import {
  AutoCompleteField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  InputTextAreaField,
  MonthField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

import {
  WithDistinctCities,
  WithDistinctCountries,
} from "/imports/ui/modules/security/common/composers";

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    visitorId: PropTypes.string,
    visitorById: PropTypes.object,
    updateVisitor: PropTypes.func,

    distinctCitiesLoading: PropTypes.bool,
    distinctCities: PropTypes.array,
    distinctCountriesLoading: PropTypes.bool,
    distinctCountries: PropTypes.array,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
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
            history.goBack();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      formDataLoading,
      visitorById,
      distinctCities,
      distinctCitiesLoading,
      distinctCountries,
      distinctCountriesLoading,
    } = this.props;
    if (formDataLoading || distinctCitiesLoading || distinctCountriesLoading)
      return null;

    const { getFieldDecorator } = this.props.form;

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

        <AutoCompleteField
          fieldName="city"
          fieldLabel="City"
          dataSource={distinctCities}
          initialValue={visitorById.city}
          required
          requiredMessage="Please input the city for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <AutoCompleteField
          fieldName="country"
          fieldLabel="Country"
          dataSource={distinctCountries}
          initialValue={visitorById.country}
          required
          requiredMessage="Please input the country for the visitor."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={visitorById.address}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <Divider />

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

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          initialValue={visitorById.contactNumber1}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          initialValue={visitorById.contactNumber2}
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
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  }),
  WithDistinctCities(),
  WithDistinctCountries()
)(GeneralInfo);
