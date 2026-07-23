import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import { filter, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';
import { WithAllCities } from 'meteor/idreesia-common/composers/common';

import { PAGED_CITIES, CITY_BY_ID, UPDATE_CITY } from '../gql';

const GeneralInfo = ({ history, cityId, allCitiesLoading, allCities }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateCity] = useMutation(UPDATE_CITY, {
    refetchQueries: [{ query: PAGED_CITIES }],
  });
  const { data, loading: cityByIdLoading } = useQuery(CITY_BY_ID, {
    variables: { _id: cityId },
  });
  const { cityById } = data || {};

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, peripheryOf, country, region }) => {
    updateCity({
      variables: {
        _id: cityById._id,
        name,
        peripheryOf,
        country,
        region,
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

  if (cityByIdLoading || allCitiesLoading) return null;
  const nonPeripheryCities = getNonPeripheryCities();

  return (
    <>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="City Name"
          initialValue={cityById.name}
          required
          requiredMessage="Please input a name for the city."
        />
        <SelectField
          data={nonPeripheryCities}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="peripheryOf"
          fieldLabel="Periphery Of"
          initialValue={cityById.peripheryOf}
        />
        <InputTextField
          fieldName="region"
          fieldLabel="Region"
          initialValue={cityById.region}
        />
        <InputTextField
          fieldName="country"
          fieldLabel="Country"
          initialValue={cityById.country}
          required
          requiredMessage="Please input a name for the country."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={cityById} />
    </>
  );
};

GeneralInfo.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  cityId: PropTypes.string,
  allCitiesLoading: PropTypes.bool,
  allCities: PropTypes.array,
};

export default flowRight(
  WithAllCities()
)(GeneralInfo);
