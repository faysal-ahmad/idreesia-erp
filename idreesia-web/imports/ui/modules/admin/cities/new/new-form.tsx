import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { filter } from 'meteor/idreesia-common/utilities/lodash';
import {
  useBreadcrumbs,
  useAllCities,
} from 'meteor/idreesia-common/hooks/common';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { PAGED_CITIES, CREATE_CITY } from '../gql';

interface CityOption {
  _id: string;
  name?: string | null;
  peripheryOf?: string | null;
}

interface FormValues {
  name: string;
  peripheryOf?: string | null;
  region?: string;
  country?: string;
}

interface Props {
  history: History;
}

const NewForm = ({ history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { allCitiesLoading, allCities } = useAllCities();
  useBreadcrumbs(['Admin', 'Locations Management', 'Cities & Mehfils', 'New']);
  const [createCity] = useMutation(CREATE_CITY, {
    refetchQueries: [{ query: PAGED_CITIES }],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, peripheryOf, region, country }: FormValues) => {
    createCity({
      variables: {
        name,
        peripheryOf,
        region,
        country: country!,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const getNonPeripheryCities = () => {
    return filter(allCities ?? [], (city: CityOption) => !city.peripheryOf);
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
        getDataValue={({ _id }: CityOption) => _id}
        getDataText={({ name }: CityOption) => name}
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

export default NewForm;
