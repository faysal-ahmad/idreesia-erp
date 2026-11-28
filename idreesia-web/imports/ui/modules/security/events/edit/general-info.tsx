import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import dayjs from 'dayjs';
import { type History } from 'history';

import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import { SECURITY_EVENT_BY_ID, UPDATE_SECURITY_EVENT, ALL_SECURITY_EVENTS } from '../gql';

interface GeneralInfoProps {
  eventId: string;
  history: History;
}

interface EventFormValues {
  name: string;
  eventDate: string | number | Date;
}

const GeneralInfo = ({ eventId, history }: GeneralInfoProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { loading, data } = useQuery(SECURITY_EVENT_BY_ID, {
    variables: { _id: eventId },
  });
  const [updateSecurityEvent] = useMutation(UPDATE_SECURITY_EVENT, {
    refetchQueries: [{ query: ALL_SECURITY_EVENTS }],
  });
  const securityEventById = data?.securityEventById;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, eventDate }: EventFormValues) => {
    if (!securityEventById?._id) return;
    updateSecurityEvent({
      variables: {
        _id: securityEventById._id,
        name,
        eventDate: String(eventDate),
      },
    })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => {
        history.goBack();
      });
  };

  if (loading || !securityEventById) return null;

  return (
    <>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Event Name"
          initialValue={securityEventById.name}
          required
          requiredMessage="Please input a name for the event."
        />
        <DateField
          fieldName="eventDate"
          fieldLabel="Event Date"
          initialValue={dayjs(Number(securityEventById.eventDate))}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityEventById} />
    </>
  );
};

export default GeneralInfo;
