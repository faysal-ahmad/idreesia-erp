import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  CascaderField,
  DateField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';
import {
  WithPortalCities,
  WithPortalCityMehfils,
} from '/imports/ui/modules/portals/common/composers';
import { getCityMehfilCascaderData } from '/imports/ui/modules/outstation/common/utilities';

import {
  PORTAL_KARKUN_BY_ID,
  UPDATE_PORTAL_KARKUN,
  PAGED_PORTAL_KARKUNS,
} from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    portalId: PropTypes.string,
    karkunId: PropTypes.string,
    portalCities: PropTypes.array,
    portalCitiesLoading: PropTypes.bool,
    portalCityMehfils: PropTypes.array,
    portalCityMehfilsLoading: PropTypes.bool,
    formDataLoading: PropTypes.bool,
    portalKarkunById: PropTypes.object,
    updatePortalKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      portalId,
      portalKarkunById,
      updatePortalKarkun,
    } = this.props;
    form.validateFields(
      (
        err,
        {
          name,
          parentName,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          currentAddress,
          permanentAddress,
          cityIdMehfilId,
          bloodGroup,
          educationalQualification,
          meansOfEarning,
          ehadDate,
          lastTarteebDate,
          referenceName,
        }
      ) => {
        if (err) return;

        updatePortalKarkun({
          variables: {
            portalId,
            _id: portalKarkunById._id,
            name,
            parentName,
            cnicNumber,
            contactNumber1,
            contactNumber2,
            emailAddress,
            currentAddress,
            permanentAddress,
            cityId: cityIdMehfilId[0],
            cityMehfilId: cityIdMehfilId[1],
            bloodGroup: bloodGroup || null,
            educationalQualification,
            meansOfEarning,
            ehadDate,
            lastTarteebDate,
            referenceName,
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
      portalCities,
      portalCitiesLoading,
      portalCityMehfils,
      portalCityMehfilsLoading,
      formDataLoading,
      portalKarkunById,
      form: { getFieldDecorator },
    } = this.props;
    if (portalCitiesLoading || portalCityMehfilsLoading || formDataLoading)
      return null;

    const cityMehfilCascaderData = getCityMehfilCascaderData(
      portalCities,
      portalCityMehfils
    );

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={portalKarkunById.name}
            required
            requiredMessage="Please input the name for the karkun."
            getFieldDecorator={getFieldDecorator}
          />

          <CascaderField
            data={cityMehfilCascaderData}
            fieldName="cityIdMehfilId"
            fieldLabel="City/Mehfil"
            initialValue={[
              portalKarkunById.cityId,
              portalKarkunById.cityMehfilId,
            ]}
            required
            requiredMessage="Please select a city/mehfil from the list."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="parentName"
            fieldLabel="S/O"
            initialValue={portalKarkunById.parentName}
            getFieldDecorator={getFieldDecorator}
          />

          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            initialValue={
              portalKarkunById.ehadDate
                ? moment(Number(portalKarkunById.ehadDate))
                : moment()
            }
            getFieldDecorator={getFieldDecorator}
          />

          <DateField
            fieldName="lastTarteebDate"
            fieldLabel="Last Tarteeb"
            initialValue={
              portalKarkunById.lastTarteebDate
                ? moment(Number(portalKarkunById.lastTarteebDate))
                : null
            }
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            initialValue={portalKarkunById.referenceName}
            getFieldDecorator={getFieldDecorator}
          />

          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            initialValue={portalKarkunById.cnicNumber || ''}
            getFieldDecorator={getFieldDecorator}
          />

          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
            initialValue={portalKarkunById.contactNumber1 || ''}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={portalKarkunById.contactNumber2}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <SelectField
            fieldName="bloodGroup"
            fieldLabel="Blood Group"
            required={false}
            data={[
              { label: 'A-', value: 'A-' },
              { label: 'A+', value: 'A+' },
              { label: 'B-', value: 'B-' },
              { label: 'B+', value: 'B+' },
              { label: 'AB-', value: 'AB-' },
              { label: 'AB+', value: 'AB+' },
              { label: 'O-', value: 'O-' },
              { label: 'O+', value: 'O+' },
            ]}
            getDataValue={({ value }) => value}
            getDataText={({ label }) => label}
            initialValue={portalKarkunById.bloodGroup}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="emailAddress"
            fieldLabel="Email"
            initialValue={portalKarkunById.emailAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="currentAddress"
            fieldLabel="Current Address"
            initialValue={portalKarkunById.currentAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="permanentAddress"
            fieldLabel="Permanent Address"
            initialValue={portalKarkunById.permanentAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="educationalQualification"
            fieldLabel="Education"
            initialValue={portalKarkunById.educationalQualification}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="meansOfEarning"
            fieldLabel="Means of Earning"
            initialValue={portalKarkunById.meansOfEarning}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={portalKarkunById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
  WithPortalCities(),
  WithPortalCityMehfils(),
  graphql(UPDATE_PORTAL_KARKUN, {
    name: 'updatePortalKarkun',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_KARKUNS, variables: { portalId, filter: {} } },
      ],
    }),
  }),
  graphql(PORTAL_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ portalId, karkunId }) => ({
      variables: { portalId, _id: karkunId },
    }),
  })
)(GeneralInfo);
