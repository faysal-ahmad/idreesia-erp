import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { graphql } from 'react-apollo';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Divider, Form, message } from '/imports/ui/controls';
import {
  AgeField,
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
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import {
  PORTAL_MEMBER_BY_ID,
  UPDATE_PORTAL_MEMBER,
  PAGED_PORTAL_MEMBERS,
} from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    portalId: PropTypes.string,
    memberId: PropTypes.string,
    portalMemberById: PropTypes.object,
    formDataLoading: PropTypes.bool,
    portalCities: PropTypes.array,
    portalCitiesLoading: PropTypes.bool,
    updatePortalMember: PropTypes.func,
  };

  handleCancel = () => {
    const { history, portalId } = this.props;
    history.push(`${paths.membersPath(portalId)}`);
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      portalId,
      portalMemberById,
      portalCities,
      updatePortalMember,
    } = this.props;
    form.validateFields(
      (
        err,
        {
          name,
          parentName,
          cnicNumber,
          ehadDate,
          birthDate,
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
                  'Please input the CNIC or Mobile Number for the member'
                ),
              ],
            },
            contactNumber1: {
              errors: [
                new Error(
                  'Please input the CNIC or Mobile Number for the member'
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

        updatePortalMember({
          variables: {
            portalId,
            _id: portalMemberById._id,
            name,
            parentName,
            cnicNumber,
            ehadDate,
            birthDate,
            referenceName,
            contactNumber1,
            contactNumber2,
            address,
            city: visitorCity.name,
            country: visitorCity.country,
          },
        })
          .then(() => {
            history.push(paths.membersPath(portalId));
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      portalMemberById,
      formDataLoading,
      portalCities,
      portalCitiesLoading,
    } = this.props;
    if (formDataLoading || portalCitiesLoading) return null;

    const { getFieldDecorator, isFieldsTouched } = this.props.form;
    const visitorCity = find(
      portalCities,
      city => city.name === portalMemberById.city
    );

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={portalMemberById.name}
            required
            requiredMessage="Please input the first name for the member."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="parentName"
            fieldLabel="S/O"
            initialValue={portalMemberById.parentName}
            required
            requiredMessage="Please input the parent name for the member."
            getFieldDecorator={getFieldDecorator}
          />

          <AgeField
            fieldName="birthDate"
            fieldLabel="Age (years)"
            initialValue={
              portalMemberById.birthDate
                ? moment(Number(portalMemberById.birthDate))
                : null
            }
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
            requiredMessage="Please select a city for the member."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="address"
            fieldLabel="Address"
            initialValue={portalMemberById.address}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <Divider />

          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            required
            initialValue={moment(Number(portalMemberById.ehadDate))}
            requiredMessage="Please specify the Ehad duration for the member."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            initialValue={portalMemberById.referenceName}
            required
            requiredMessage="Please input the referene name for the member."
            getFieldDecorator={getFieldDecorator}
          />

          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            initialValue={portalMemberById.cnicNumber || ''}
            requiredMessage="Please input the CNIC for the member."
            getFieldDecorator={getFieldDecorator}
          />

          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
            initialValue={portalMemberById.contactNumber1 || ''}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={portalMemberById.contactNumber2}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <RecordInfo record={portalMemberById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
  WithPortalCities(),
  graphql(UPDATE_PORTAL_MEMBER, {
    name: 'updatePortalMember',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_MEMBERS, variables: { portalId } },
      ],
    }),
  }),
  graphql(PORTAL_MEMBER_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ portalId, memberId }) => ({
      variables: { portalId, _id: memberId },
    }),
  })
)(GeneralInfo);
