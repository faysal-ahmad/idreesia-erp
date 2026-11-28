import React, { Fragment, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type match } from 'react-router';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import {
  SETUP_SECURITY_EVENT_DUTY_BY_ID,
  UPDATE_SECURITY_EVENT_DUTY,
} from './gql';

interface EditFormProps {
  match: match<{ eventDutyId: string }>;
  history: History;
}

interface FormValues {
  name: string;
  urduName: string;
}

const EditForm = ({ match, history }: EditFormProps) => {
  useBreadcrumbs(['Security', 'Event Duties', 'Edit']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const eventDutyId = match.params.eventDutyId;
  const { loading, data } = useQuery(SETUP_SECURITY_EVENT_DUTY_BY_ID, {
    variables: { id: eventDutyId },
  });
  const [updateSecurityEventDuty] = useMutation(UPDATE_SECURITY_EVENT_DUTY, {
    refetchQueries: ['setupAllSecurityEventDuties'],
  });
  const securityEventDutyById = data?.securityEventDutyById;

  const handleCancel = () => {
    history.push(paths.eventDutiesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityEventDutyById?._id) return;
    updateSecurityEventDuty({
      variables: {
        id: securityEventDutyById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.eventDutiesPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityEventDutyById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityEventDutyById.name ?? undefined}
          required
          requiredMessage="Please input a name for the event duty."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityEventDutyById.urduName ?? undefined}
          required
          requiredMessage="Please input an urdu name for the event duty."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityEventDutyById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
