import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Collapse, Form, Space, Spin, type CollapseProps } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  InputTextField,
  SwitchField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { USER_BY_ID, PAGED_USERS, UPDATE_USER } from '../gql';

interface Props {
  userId: string;
  history: History;
}

interface FormValues {
  password?: string;
  email?: string;
  displayName?: string;
  locked?: boolean;
}

const GeneralInfo = ({ userId, history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(USER_BY_ID, {
    variables: { _id: userId },
  });
  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [
      { query: PAGED_USERS, variables: { filter: {} } },
      'adminUserById',
    ],
  });
  const userById = data?.userById;

  const handleCancel = () => {
    history.push(paths.usersPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    password,
    email,
    displayName,
    locked,
  }: FormValues) => {
    if (email && !email.includes('@gmail.com')) {
      message.error('This is not a valid Google Email.', 5);
      return;
    }

    updateUser({
      variables: {
        userId: userById?._id ?? userId,
        password,
        email,
        displayName,
        locked,
      },
    })
      .then(() => {
        message.success('User updated', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !userById) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const karkunField = userById.personId ? (
    <InputTextField
      fieldName="karkunName"
      fieldLabel="Karkun Name"
      disabled
      initialValue={userById.karkun ? userById.karkun.name : ''}
    />
  ) : (
    <KarkunSelectionInputField
      fieldName="karkun"
      fieldLabel="Karkun Name"
      showMsKarkunsList
    />
  );

  const accountItem: NonNullable<CollapseProps['items']>[number] = {
    key: 'account',
    label: 'Account Information',
    forceRender: true,
    children: (
      <>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled
          initialValue={userById.username}
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
          initialValue={userById.email}
        />

        <InputTextField
          fieldName="displayName"
          fieldLabel="Display Name"
          initialValue={userById.displayName}
        />

        {karkunField}
      </>
    ),
  };

  return (
    <div className="visitor-form">
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <Space orientation="vertical" size={16} style={{ display: 'flex', width: '100%' }}>
          <Collapse
            className="visitor-form-sections"
            defaultActiveKey={['account']}
            items={[accountItem]}
          />

          <FormButtonsSaveCancel
            handleCancel={handleCancel}
            isFieldsTouched={isFieldsTouched}
            fullWidth
          />
        </Space>
      </Form>
    </div>
  );
};

export default GeneralInfo;
