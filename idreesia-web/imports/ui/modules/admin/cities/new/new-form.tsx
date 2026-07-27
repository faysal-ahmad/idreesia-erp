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

const AntForm = Form as any;
const TextField = InputTextField as any;
const SelectInputField = SelectField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
type AnyRecord = Record<string, any>;
interface City { _id: string; name?: string; peripheryOf?: string | null; country?: string; region?: string; }
interface HistoryLike { goBack(): void; }
interface FormValues { name: string; peripheryOf?: string | null; region?: string; country?: string; }
interface Props { history: HistoryLike; cityId?: string | null; allCitiesLoading?: boolean; allCities?: City[]; }
interface QueryData { cityById?: City | null; }

const NewForm = ({ history, allCitiesLoading, allCities }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createCity] = useMutation(CREATE_CITY as any, {
    refetchQueries: [{ query: PAGED_CITIES as any }],
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
        country,
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
    return filter(allCities ?? [], (city: City) => !city.peripheryOf);
  };

  if (allCitiesLoading) return null;
  const nonPeripheryCities = getNonPeripheryCities();

  return (
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="City Name"
        required
        requiredMessage="Please input a name for the city."
      />
      <SelectInputField
        data={nonPeripheryCities}
        getDataValue={({ _id }: City) => _id}
        getDataText={({ name }: City) => name}
        fieldName="peripheryOf"
        fieldLabel="Periphery Of"
      />
      <TextField
        fieldName="region"
        fieldLabel="Region"
      />
      <TextField
        fieldName="country"
        fieldLabel="Country"
        initialValue="Pakistan"
        required
        requiredMessage="Please input a name for the country."
      />
      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
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
)(NewForm as any);
