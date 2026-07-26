import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { filter, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { WithAllCities } from 'meteor/idreesia-common/composers/common';

import { PAGED_CITIES, CREATE_CITY } from '../gql';

const NewForm = ({ history, allCitiesLoading, allCities }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createCity] = useMutation(CREATE_CITY, {
    refetchQueries: [{ query: PAGED_CITIES }],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, peripheryOf, region, country }) => {
    createCity({
      variables: {
        name,
        peripheryOf,
        region,
        country,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const getNonPeripheryCities = () => {
    return filter(allCities, city => !city.peripheryOf);
  };

  if (allCitiesLoading) return null;
  const nonPeripheryCities = getNonPeripheryCities();

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="City Name"
        required
        requiredMessage="Please input a name for the city."
      />
      <SelectField
        data={nonPeripheryCities}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="peripheryOf"
        fieldLabel="Periphery Of"
      />
      <InputTextField
        fieldName="region"
        fieldLabel="Region"
      />
      <InputTextField
        fieldName="country"
        fieldLabel="Country"
        initialValue="Pakistan"
        required
        requiredMessage="Please input a name for the country."
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  allCitiesLoading: PropTypes.bool,
  allCities: PropTypes.array,
};

export default flowRight(
  WithAllCities(),
  WithBreadcrumbs(['Admin', 'Locations Management', 'Cities & Mehfils', 'New'])
)(NewForm);
