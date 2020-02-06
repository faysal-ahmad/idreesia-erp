import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { find, flowRight } from 'lodash';

import { Divider, Form, message } from '/imports/ui/controls';
import {
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  InputTextAreaField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';
import { WithPortalCities } from '/imports/ui/modules/portals/common/composers';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    portalId: PropTypes.string,
    visitorId: PropTypes.string,
    portalVisitorById: PropTypes.object,
    formDataLoading: PropTypes.bool,
    portalCities: PropTypes.array,
    portalCitiesLoading: PropTypes.bool,
    updatePortalVisitor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(`${paths.visitorRegistrationPath}`);
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      portalId,
      portalVisitorById,
      portalCities,
      updatePortalVisitor,
    } = this.props;
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
          cityCountry,
        }
      ) => {
        if (err) return;
        if (!cnicNumber && !contactNumber1) {
          form.setFields({
            cnicNumber: {
              errors: [
                new Error(
                  'Please input the CNIC or Mobile Number for the visitor'
                ),
              ],
            },
            contactNumber1: {
              errors: [
                new Error(
                  'Please input the CNIC or Mobile Number for the visitor'
                ),
              ],
            },
          });

          return;
        }

        const visitorCity = find(
          portalCities,
          city => city._id === cityCountry
        );

        updatePortalVisitor({
          variables: {
            portalId,
            _id: portalVisitorById._id,
            name,
            parentName,
            cnicNumber,
            ehadDate,
            referenceName,
            contactNumber1,
            contactNumber2,
            address,
            city: visitorCity.name,
            country: visitorCity.country,
          },
        })
          .then(() => {
            history.push(`${paths.visitorRegistrationPath}`);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      portalVisitorById,
      formDataLoading,
      portalCities,
      portalCitiesLoading,
    } = this.props;
    if (formDataLoading || portalCitiesLoading) return null;

    const { getFieldDecorator } = this.props.form;
    const visitorCity = find(
      portalCities,
      city => city.name === portalVisitorById.city
    );

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={portalVisitorById.name}
            required
            requiredMessage="Please input the first name for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="parentName"
            fieldLabel="S/O"
            initialValue={portalVisitorById.parentName}
            required
            requiredMessage="Please input the parent name for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <SelectField
            allowClear={false}
            data={portalCities}
            initialValue={visitorCity._id}
            getDataValue={({ _id }) => _id}
            getDataText={({ name, country }) => `${name}, ${country}`}
            fieldName="cityCountry"
            fieldLabel="City / Country"
            required
            requiredMessage="Please select a city for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="address"
            fieldLabel="Address"
            initialValue={portalVisitorById.address}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <Divider />

          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            required
            initialValue={moment(Number(portalVisitorById.ehadDate))}
            requiredMessage="Please specify the Ehad duration for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            initialValue={portalVisitorById.referenceName}
            required
            requiredMessage="Please input the referene name for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            initialValue={portalVisitorById.cnicNumber || ''}
            requiredMessage="Please input the CNIC for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
            initialValue={portalVisitorById.contactNumber1 || ''}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={portalVisitorById.contactNumber2}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={portalVisitorById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query portalVisitorById($portalId: String!, $_id: String!) {
    portalVisitorById(portalId: $portalId, _id: $_id) {
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
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updatePortalVisitor(
    $portalId: String!
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
    updatePortalVisitor(
      portalId: $portalId
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

export default flowRight(
  Form.create(),
  WithPortalCities(),
  graphql(formMutation, {
    name: 'updatePortalVisitor',
    options: {
      refetchQueries: ['pagedPortalVisitors'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ portalId, visitorId }) => ({
      variables: { portalId, _id: visitorId },
    }),
  })
)(GeneralInfo);
