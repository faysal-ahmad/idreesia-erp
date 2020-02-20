import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { Divider, Form, message } from '/imports/ui/controls';
import {
  AutoCompleteField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

import {
  WithDistinctCities,
  WithDistinctCountries,
} from 'meteor/idreesia-common/composers/security';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { UPDATE_SECURITY_VISITOR, SECURITY_VISITOR_BY_ID } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    visitorId: PropTypes.string,
    securityVisitorById: PropTypes.object,
    updateSecurityVisitor: PropTypes.func,

    distinctCitiesLoading: PropTypes.bool,
    distinctCities: PropTypes.array,
    distinctCountriesLoading: PropTypes.bool,
    distinctCountries: PropTypes.array,
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
      securityVisitorById,
      updateSecurityVisitor,
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
          city,
          country,
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

        updateSecurityVisitor({
          variables: {
            _id: securityVisitorById._id,
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
            history.push(`${paths.visitorRegistrationPath}`);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  handleIsMinorChanged = checked => {
    this.setState({
      cnicRequired: !checked,
      mobileRequired: checked,
    });
  };

  render() {
    const {
      formDataLoading,
      securityVisitorById,
      distinctCities,
      distinctCitiesLoading,
      distinctCountries,
      distinctCountriesLoading,
    } = this.props;
    if (formDataLoading || distinctCitiesLoading || distinctCountriesLoading)
      return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={securityVisitorById.name}
            required
            requiredMessage="Please input the first name for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="parentName"
            fieldLabel="S/O"
            initialValue={securityVisitorById.parentName}
            required
            requiredMessage="Please input the parent name for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <AutoCompleteField
            fieldName="city"
            fieldLabel="City"
            dataSource={distinctCities}
            initialValue={securityVisitorById.city}
            required
            requiredMessage="Please input the city for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <AutoCompleteField
            fieldName="country"
            fieldLabel="Country"
            dataSource={distinctCountries}
            initialValue={securityVisitorById.country}
            required
            requiredMessage="Please input the country for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="address"
            fieldLabel="Address"
            initialValue={securityVisitorById.address}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <Divider />

          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            required
            initialValue={moment(Number(securityVisitorById.ehadDate))}
            requiredMessage="Please specify the Ehad duration for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            initialValue={securityVisitorById.referenceName}
            required
            requiredMessage="Please input the referene name for the visitor."
            getFieldDecorator={getFieldDecorator}
          />

          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            initialValue={securityVisitorById.cnicNumber || ''}
            getFieldDecorator={getFieldDecorator}
          />

          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
            initialValue={securityVisitorById.contactNumber1 || ''}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={securityVisitorById.contactNumber2}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={securityVisitorById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(UPDATE_SECURITY_VISITOR, {
    name: 'updateSecurityVisitor',
    options: {
      refetchQueries: ['pagedSecurityVisitors'],
    },
  }),
  graphql(SECURITY_VISITOR_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  }),
  WithDistinctCities(),
  WithDistinctCountries()
)(GeneralInfo);
