import React, { Fragment, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';
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
  SETUP_SECURITY_MEHFIL_DUTY_BY_ID,
  UPDATE_SECURITY_MEHFIL_DUTY,
} from './gql';

interface EditFormProps {
  match: match<{ mehfilDutyId: string }>;
  history: History;
}

interface FormValues {
  name: string;
  urduName: string;
}

const EditForm = ({ match, history }: EditFormProps) => {
  useBreadcrumbs(['Security', 'Mehfil Duties', 'Edit']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const mehfilDutyId = match.params.mehfilDutyId;
  const { loading, data } = useQuery(SETUP_SECURITY_MEHFIL_DUTY_BY_ID, {
    variables: { id: mehfilDutyId },
  });
  const [updateSecurityMehfilDuty] = useMutation(UPDATE_SECURITY_MEHFIL_DUTY, {
    refetchQueries: ['setupAllSecurityMehfilDuties'],
  });
  const securityMehfilDutyById = data?.securityMehfilDutyById;

  const handleCancel = () => {
    history.push(paths.mehfilDutiesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityMehfilDutyById?._id) return;
    updateSecurityMehfilDuty({
      variables: {
        id: securityMehfilDutyById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilDutiesPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityMehfilDutyById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityMehfilDutyById.name ?? undefined}
          required
          requiredMessage="Please input a name for the mehfil duty."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilDutyById.urduName ?? undefined}
          required
          requiredMessage="Please input an urdu name for the mehfil duty."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityMehfilDutyById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
