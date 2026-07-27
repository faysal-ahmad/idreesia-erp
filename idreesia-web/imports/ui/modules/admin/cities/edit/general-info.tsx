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

const AuditInfoComponent = AuditInfo as any;
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

const GeneralInfo = ({ history, cityId, allCitiesLoading, allCities }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateCity] = useMutation(UPDATE_CITY as any, {
    refetchQueries: [{ query: PAGED_CITIES as any }],
  });
  const { data, loading: cityByIdLoading } = useQuery(CITY_BY_ID as any, {
    variables: { _id: cityId },
  });
  const { cityById } = (data ?? {}) as QueryData;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, peripheryOf, country, region }: FormValues) => {
    updateCity({
      variables: {
        _id: cityById?._id,
        name,
        peripheryOf,
        country,
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
    return filter(allCities ?? [], (city: City) => !city.peripheryOf);
  };

  if (cityByIdLoading || allCitiesLoading || !cityById) return null;
  const nonPeripheryCities = getNonPeripheryCities();

  return (
    <>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="City Name"
          initialValue={cityById.name}
          required
          requiredMessage="Please input a name for the city."
        />
        <SelectInputField
          data={nonPeripheryCities}
          getDataValue={({ _id }: City) => _id}
          getDataText={({ name }: City) => name}
          fieldName="peripheryOf"
          fieldLabel="Periphery Of"
          initialValue={cityById.peripheryOf}
        />
        <TextField
          fieldName="region"
          fieldLabel="Region"
          initialValue={cityById.region}
        />
        <TextField
          fieldName="country"
          fieldLabel="Country"
          initialValue={cityById.country}
          required
          requiredMessage="Please input a name for the country."
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={cityById} />
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
)(GeneralInfo as any);
