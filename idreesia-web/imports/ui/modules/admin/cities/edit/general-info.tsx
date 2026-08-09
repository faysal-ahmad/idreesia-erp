import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { filter } from 'meteor/idreesia-common/utilities/lodash';
import { useAllCities } from 'meteor/idreesia-common/hooks/common';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import { PAGED_CITIES, CITY_BY_ID, UPDATE_CITY } from '../gql';

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
  cityId: string;
}

const GeneralInfo = ({ history, cityId }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { allCitiesLoading, allCities } = useAllCities();
  const [updateCity] = useMutation(UPDATE_CITY, {
    refetchQueries: [{ query: PAGED_CITIES }],
  });
  const { data, loading: cityByIdLoading } = useQuery(CITY_BY_ID, {
    variables: { _id: cityId },
  });
  const cityById = data?.cityById;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, peripheryOf, country, region }: FormValues) => {
    updateCity({
      variables: {
        _id: cityId,
        name,
        peripheryOf,
        country: country!,
        region,
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

  if (cityByIdLoading || allCitiesLoading || !cityById) return null;
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
          getDataValue={({ _id }: CityOption) => _id}
          getDataText={({ name }: CityOption) => name}
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

export default GeneralInfo;
