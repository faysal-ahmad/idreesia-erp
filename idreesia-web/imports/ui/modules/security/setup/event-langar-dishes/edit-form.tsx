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
  SECURITY_EVENT_LANGAR_DISH_BY_ID,
  UPDATE_SECURITY_EVENT_LANGAR_DISH,
} from './gql';

interface EditFormProps {
  match: match<{ eventLangarDishId: string }>;
  history: History;
}

interface FormValues {
  name: string;
  urduName: string;
}

const EditForm = ({ match, history }: EditFormProps) => {
  useBreadcrumbs(['Security', 'Event Langar Dishes', 'Edit']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const eventLangarDishId = match.params.eventLangarDishId;
  const { loading, data } = useQuery(SECURITY_EVENT_LANGAR_DISH_BY_ID, {
    variables: { id: eventLangarDishId },
  });
  const [updateSecurityEventLangarDish] = useMutation(UPDATE_SECURITY_EVENT_LANGAR_DISH, {
    refetchQueries: ['allSecurityEventLangarDishes'],
  });
  const securityEventLangarDishById = data?.securityEventLangarDishById;

  const handleCancel = () => {
    history.push(paths.eventLangarDishesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityEventLangarDishById?._id) return;
    updateSecurityEventLangarDish({
      variables: {
        id: securityEventLangarDishById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.eventLangarDishesPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityEventLangarDishById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityEventLangarDishById.name ?? undefined}
          required
          requiredMessage="Please input a name for the langar dish."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityEventLangarDishById.urduName ?? undefined}
          required
          requiredMessage="Please input an urdu name for the langar dish."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityEventLangarDishById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
