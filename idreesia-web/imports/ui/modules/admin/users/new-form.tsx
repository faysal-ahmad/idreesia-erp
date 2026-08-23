import React, { useRef, useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Collapse, Form, FormInstance, Space, type CollapseProps } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  InputTextField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { CREATE_USER, PAGED_USERS } from './gql';

interface KarkunValue {
  _id?: string;
}

interface FormValues {
  karkun?: KarkunValue | null;
  userName?: string;
  password?: string;
  email?: string;
  displayName?: string;
}

type Props = RouteComponentProps;

const NewForm = ({ history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const formRef = useRef<FormInstance>(null);
  useBreadcrumbs(['Admin', 'Users', 'New']);
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: PAGED_USERS, variables: { filter: {} } }],
  });

  const handleCancel = () => {
    history.push(paths.usersPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    karkun,
    userName,
    password,
    email,
    displayName,
  }: FormValues) => {
    if ((userName && password) || (email && email.includes('@gmail.com'))) {
      createUser({
        variables: {
          personId: karkun ? karkun._id : null,
          userName,
          password,
          email,
          displayName,
        },
      })
        .then(result => {
          message.success('User created', 2);
          const newUserId = result.data?.createUser?._id;
          history.push(
            newUserId ? `${paths.usersPath}/${newUserId}` : paths.usersPath
          );
        })
        .catch((error: Error) => {
          message.error(error.message, 5);
        });
    } else {
      formRef.current?.setFields([
        {
          name: 'userName',
          errors: [
            'Either user name and password, or google email is required to create an account.',
          ],
        },
        {
          name: 'password',
          errors: [
            'Either user name and password, or google email is required to create an account.',
          ],
        },
        {
          name: 'email',
          errors: [
            'Either user name and password, or google email is required to create an account.',
          ],
        },
      ]);
    }
  };

  const accountItem: NonNullable<CollapseProps['items']>[number] = {
    key: 'account',
    label: 'Account Information',
    forceRender: true,
    children: (
      <>
        <InputTextField fieldName="userName" fieldLabel="User name" />

        <InputTextField
          fieldName="password"
          fieldLabel="Password"
          type="password"
        />

        <InputTextField fieldName="email" fieldLabel="Google Email" />

        <InputTextField fieldName="displayName" fieldLabel="Display name" />

        <KarkunSelectionInputField
          fieldName="karkun"
          fieldLabel="Karkun Name"
          showMsKarkunsList
        />
      </>
    ),
  };

  return (
    <div className="visitor-form">
      <Form
        ref={formRef}
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

export default NewForm;
