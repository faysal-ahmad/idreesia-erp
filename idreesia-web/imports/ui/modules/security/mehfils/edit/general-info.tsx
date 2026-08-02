import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import { type History } from 'history';

import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import { MEHFIL_BY_ID, UPDATE_MEHFIL, ALL_MEHFILS } from '../gql';

interface GeneralInfoProps {
  mehfilId: string;
  history: History;
}

interface MehfilFormValues {
  name: string;
  mehfilDate: string | number | Date;
}

const GeneralInfo = ({ mehfilId, history }: GeneralInfoProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { loading, data } = useQuery(MEHFIL_BY_ID, {
    variables: { _id: mehfilId },
  });
  const [updateMehfil] = useMutation(UPDATE_MEHFIL, {
    refetchQueries: [{ query: ALL_MEHFILS }],
  });
  const mehfilById = data?.mehfilById;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, mehfilDate }: MehfilFormValues) => {
    if (!mehfilById?._id) return;
    updateMehfil({
      variables: {
        _id: mehfilById._id,
        name,
        mehfilDate: String(mehfilDate),
      },
    })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => {
        history.goBack();
      });
  };

  if (loading || !mehfilById) return null;

  return (
    <>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Mehfil Name"
          initialValue={mehfilById.name}
          required
          requiredMessage="Please input a name for the Mehfil."
        />
        <DateField
          fieldName="mehfilDate"
          fieldLabel="Mehfil Date"
          initialValue={dayjs(Number(mehfilById.mehfilDate))}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={mehfilById} />
    </>
  );
};

export default GeneralInfo;
