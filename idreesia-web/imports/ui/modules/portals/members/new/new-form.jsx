import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
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
import {
  WithPortal,
  WithPortalCities,
} from '/imports/ui/modules/portals/common/composers';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import { CREATE_PORTAL_MEMBER, PAGED_PORTAL_MEMBERS } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createPortalMember: PropTypes.func,

    portal: PropTypes.object,
    portalLoading: PropTypes.bool,
    portalCities: PropTypes.array,
    portalCitiesLoading: PropTypes.bool,
  };

  formRef = React.createRef();

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
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
      createPortalMember,
      history,
      portal,
      portalCities,
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

      createPortalMember({
        variables: {
          portalId: portal._id,
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
        .then(({ data: { createPortalMember: newMember } }) => {
          history.push(paths.membersEditFormPath(portal._id, newMember._id));
        })
        .catch(error => {
          message.error(error.message, 5);
        });
  };

  render() {
    const {
      portalLoading,
      portalCities,
      portalCitiesLoading,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (portalLoading || portalCitiesLoading) return null;

    return (
      <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the member."
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the member."
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
        />

        <SelectField
          allowClear={false}
          data={portalCities}
          initialValue={portalCities[0]._id}
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
          required={false}
        />

        <InputTextAreaField
          fieldName="permanentAddress"
          fieldLabel="Permanent Address"
          required={false}
        />

        <Divider />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          required
          requiredMessage="Please specify the Ehad duration for the member."
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          required
          requiredMessage="Please input the reference name for the member."
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          requiredMessage="Please input the CNIC for the member."
        />

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          requiredMessage="Please input the mobile number for the member."
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          required={false}
        />

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  WithPortal(),
  WithPortalCities(),
  graphql(CREATE_PORTAL_MEMBER, {
    name: 'createPortalMember',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_MEMBERS, variables: { portalId } },
      ],
    }),
  }),
  WithDynamicBreadcrumbs(({ portal }) => {
    if (portal) {
      return `Mehfil Portal, ${portal.name}, Members, New`;
    }
    return `Mehfil Portal, Members, New`;
  })
)(NewForm);
