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
  SECURITY_MEHFIL_LANGAR_DISH_BY_ID,
  UPDATE_SECURITY_MEHFIL_LANGAR_DISH,
} from './gql';

interface EditFormProps {
  match: match<{ mehfilLangarDishId: string }>;
  history: History;
}

interface FormValues {
  name: string;
  urduName: string;
}

const EditForm = ({ match, history }: EditFormProps) => {
  useBreadcrumbs(['Security', 'Mehfil Langar Dishes', 'Edit']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const mehfilLangarDishId = match.params.mehfilLangarDishId;
  const { loading, data } = useQuery(SECURITY_MEHFIL_LANGAR_DISH_BY_ID, {
    variables: { id: mehfilLangarDishId },
  });
  const [updateSecurityMehfilLangarDish] = useMutation(UPDATE_SECURITY_MEHFIL_LANGAR_DISH, {
    refetchQueries: ['allSecurityMehfilLangarDishes'],
  });
  const securityMehfilLangarDishById = data?.securityMehfilLangarDishById;

  const handleCancel = () => {
    history.push(paths.mehfilLangarDishesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityMehfilLangarDishById?._id) return;
    updateSecurityMehfilLangarDish({
      variables: {
        id: securityMehfilLangarDishById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilLangarDishesPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityMehfilLangarDishById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityMehfilLangarDishById.name ?? undefined}
          required
          requiredMessage="Please input a name for the langar dish."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilLangarDishById.urduName ?? undefined}
          required
          requiredMessage="Please input an urdu name for the langar dish."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityMehfilLangarDishById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
