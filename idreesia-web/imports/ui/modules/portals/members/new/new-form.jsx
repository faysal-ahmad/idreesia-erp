import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
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
    form: PropTypes.object,
    createPortalMember: PropTypes.func,

    portal: PropTypes.object,
    portalLoading: PropTypes.bool,
    portalCities: PropTypes.array,
    portalCitiesLoading: PropTypes.bool,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      createPortalMember,
      history,
      portal,
      portalCities,
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
            address,
            city: visitorCity.name,
            country: visitorCity.country,
          },
        })
          .then(({ data: { createPortalMember: newMember } }) => {
            history.push(paths.membersEditFormPath(portal._id, newMember._id));
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      portalLoading,
      portalCities,
      portalCitiesLoading,
      form,
    } = this.props;
    if (portalLoading || portalCitiesLoading) return null;

    const { getFieldDecorator } = form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the member."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the member."
          getFieldDecorator={getFieldDecorator}
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          getFieldDecorator={getFieldDecorator}
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
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <Divider />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          required
          requiredMessage="Please specify the Ehad duration for the member."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          required
          requiredMessage="Please input the reference name for the member."
          getFieldDecorator={getFieldDecorator}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          requiredMessage="Please input the CNIC for the member."
          getFieldDecorator={getFieldDecorator}
        />

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          requiredMessage="Please input the mobile number for the member."
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

export default flowRight(
  Form.create(),
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
