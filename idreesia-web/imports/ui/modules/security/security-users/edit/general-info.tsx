import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Form } from 'antd';
import { type History } from 'history';

import {
  InputTextField,
  SwitchField,
  FormButtonsClose,
} from '/imports/ui/modules/helpers/fields';

import { USER_BY_ID } from '../gql';

interface GeneralInfoProps {
  history: History;
  userId: string;
}

const GeneralInfo = ({ history, userId }: GeneralInfoProps) => {
  const { data, loading } = useQuery(USER_BY_ID, {
    variables: { _id: userId },
  });
  const userById = data?.userById;

  const handleClose = () => {
    history.goBack();
  };

  if (loading || !userById) return null;

  return (
    <Form layout="horizontal">
      <InputTextField
        fieldName="userName"
        fieldLabel="User name"
        disabled
        initialValue={userById.username ?? undefined}
      />

      <SwitchField
        fieldName="locked"
        fieldLabel="Locked"
        initialValue={userById.locked ?? undefined}
      />

      <InputTextField
        fieldName="password"
        fieldLabel="Password"
        type="password"
      />

      <InputTextField
        fieldName="email"
        fieldLabel="Google Email"
        initialValue={userById.email ?? undefined}
      />

      <InputTextField
        fieldName="displayName"
        fieldLabel="Display Name"
        initialValue={userById.displayName ?? undefined}
      />

      <InputTextField
        fieldName="personName"
        fieldLabel="Person Name"
        disabled
        initialValue={userById.person?.sharedData?.name ?? ''}
      />

      <FormButtonsClose
        handleClose={handleClose}
      />
    </Form>
  );
};

export default GeneralInfo;
