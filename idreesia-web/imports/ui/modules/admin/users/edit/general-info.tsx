import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import {
  InputTextField,
  SwitchField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { USER_BY_ID, PAGED_USERS, UPDATE_USER } from '../gql';

const AntForm = Form as any;
const TextField = InputTextField as any;
const SwitchInputField = SwitchField as any;
const KarkunSelectionField = KarkunSelectionInputField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { goBack(): void; }
interface QueryData { userById?: AnyRecord | null; }
interface Props { userId?: string | null; history: HistoryLike; }
interface FormValues { password?: string; email?: string; displayName?: string; locked?: boolean; }

const GeneralInfo = ({ userId, history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(USER_BY_ID as any, {
    variables: { _id: userId },
  });
  const [updateUser] = useMutation(UPDATE_USER as any, {
    refetchQueries: [{ query: PAGED_USERS as any, variables: { filter: {} } }],
  });
  const { userById } = (data ?? {}) as QueryData;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ password, email, displayName, locked }: FormValues) => {
    if (email && !email.includes('@gmail.com')) {
      message.error('This is not a valid Google Email.', 5);
      return;
    }

    updateUser({
      variables: {
        userId: userById?._id,
        password,
        email,
        displayName,
        locked,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !userById) return null;

  const karkunField = userById.personId ? (
    <TextField
      fieldName="karkunName"
      fieldLabel="Karkun Name"
      disabled
      initialValue={userById.karkun ? userById.karkun.name : ''}
    />
  ) : (
    <KarkunSelectionField
      fieldName="karkun"
      fieldLabel="Karkun Name"
      showMsKarkunsList
    />
  );

  return (
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="userName"
        fieldLabel="User name"
        disabled
        initialValue={userById.username}
      />

      <SwitchInputField
        fieldName="locked"
        fieldLabel="Locked"
        initialValue={userById.locked}
      />

      <TextField
        fieldName="password"
        fieldLabel="Password"
        type="password"
      />

      <TextField
        fieldName="email"
        fieldLabel="Google Email"
        initialValue={userById.email}
      />

      <TextField
        fieldName="displayName"
        fieldLabel="Display Name"
        initialValue={userById.displayName}
      />

      {karkunField}

      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

GeneralInfo.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  userId: PropTypes.string,
};

export default GeneralInfo;
