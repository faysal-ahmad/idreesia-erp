import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
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
import { AuditInfo } from '/imports/ui/modules/common';
import { WithPortalCities } from '/imports/ui/modules/portals/common/composers';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import {
  UPDATE_PORTAL_MEMBER,
  PAGED_PORTAL_MEMBERS,
} from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    portalId: PropTypes.string,
    memberId: PropTypes.string,
    portalMemberById: PropTypes.object,

    portalCities: PropTypes.array,
    portalCitiesLoading: PropTypes.bool,
    updatePortalMember: PropTypes.func,
  };
  
  formRef = React.createRef();

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history, portalId } = this.props;
    history.push(`${paths.membersPath(portalId)}`);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({
    name,
    parentName,
    cnicNumber,
    ehadDate,
    birthDate,
    referenceName,
    contactNumber1,
    contactNumber2,
    cityCountry,
    currentAddress,
    permanentAddress,
  }) => {
    const {
      history,
      portalId,
      portalMemberById,
      portalCities,
      updatePortalMember,
    } = this.props;
      if (!cnicNumber && !contactNumber1) {
        this.formRef.current.setFields([
          {
            name: "cnicNumber",
            errors: ['Please input the CNIC or Mobile Number for the member'],
          },
          {
            name: "contactNumber1",
            errors: ['Please input the CNIC or Mobile Number for the member'],
          },
        ]);

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
          city: visitorCity.name,
          country: visitorCity.country,
          currentAddress,
          permanentAddress,
        },
      })
        .then(() => {
          history.push(paths.membersPath(portalId));
        })
        .catch(error => {
          message.error(error.message, 5);
        });
  };

  render() {
    const {
      portalMemberById,
      portalCities,
      portalCitiesLoading,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (portalCitiesLoading) return null;

    const visitorCity = find(
      portalCities,
      city => city.name === portalMemberById.city
    );

    return (
      <>
        <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={portalMemberById.name}
            required
            requiredMessage="Please input the first name for the member."
          />

          <InputTextField
            fieldName="parentName"
            fieldLabel="S/O"
            initialValue={portalMemberById.parentName}
            required
            requiredMessage="Please input the parent name for the member."
          />

          <AgeField
            fieldName="birthDate"
            fieldLabel="Age (years)"
            initialValue={
              portalMemberById.birthDate
                ? dayjs(Number(portalMemberById.birthDate))
                : null
            }
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
          />

          <InputTextAreaField
            fieldName="currentAddress"
            fieldLabel="Current Address"
            initialValue={portalMemberById.currentAddress}
            required={false}
          />

          <InputTextAreaField
            fieldName="permanentAddress"
            fieldLabel="Permanent Address"
            initialValue={portalMemberById.permanentAddress}
            required={false}
          />

          <Divider />

          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            required
            initialValue={dayjs(Number(portalMemberById.ehadDate))}
            requiredMessage="Please specify the Ehad duration for the member."
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            initialValue={portalMemberById.referenceName}
            required
            requiredMessage="Please input the referene name for the member."
          />

          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            initialValue={portalMemberById.cnicNumber || ''}
            requiredMessage="Please input the CNIC for the member."
          />

          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
            initialValue={portalMemberById.contactNumber1 || ''}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={portalMemberById.contactNumber2}
            required={false}
          />

          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={portalMemberById} />
      </>
    );
  }
}

export default flowRight(
  WithPortalCities(),
  graphql(UPDATE_PORTAL_MEMBER, {
    name: 'updatePortalMember',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_MEMBERS, variables: { portalId } },
      ],
    }),
  })
)(GeneralInfo);
