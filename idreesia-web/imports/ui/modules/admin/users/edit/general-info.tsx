import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { MessageOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Form,
  Space,
  Spin,
  Tooltip,
  type CollapseProps,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  InputTextField,
  SwitchField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  USER_BY_ID,
  PAGED_USERS,
  UPDATE_USER,
  CREATE_CHAT_ACCOUNT,
} from '../gql';

interface Props {
  userId: string;
  history: History;
}

interface FormValues {
  userName?: string;
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
  const [createChatAccount, { loading: creatingChatAccount }] = useMutation(
    CREATE_CHAT_ACCOUNT,
    {
      refetchQueries: [
        { query: PAGED_USERS, variables: { filter: {} } },
        'adminUserById',
      ],
    }
  );
  const userById = data?.userById;

  const handleCancel = () => {
    history.push(paths.usersPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    userName,
    password,
    email,
    displayName,
    locked,
  }: FormValues) => {
    updateUser({
      variables: {
        userId: userById?._id ?? userId,
        // A user name can only be set once; after that the field is locked.
        userName: !userById?.username && userName ? userName : undefined,
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

  const handleCreateChatAccount = () => {
    createChatAccount({ variables: { userId: userById?._id ?? userId } })
      .then(() => {
        message.success('Chat account created', 2);
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

  // Uses the saved values, not what is typed in the form: the chat account
  // is created from the stored user name and display name.
  const canCreateChatAccount =
    !!userById.username && !!userById.displayName?.trim();
  const createChatAccountButton = userById.hasChatAccount ? null : (
    <Tooltip
      title={
        canCreateChatAccount
          ? undefined
          : 'Set and save a user name and display name first'
      }
    >
      <Button
        size="large"
        icon={<MessageOutlined />}
        disabled={!canCreateChatAccount}
        loading={creatingChatAccount}
        onClick={handleCreateChatAccount}
      >
        Create Chat Account
      </Button>
    </Tooltip>
  );

  const karkunField = userById.personId ? (
    <InputTextField
      fieldName="karkunName"
      fieldLabel="Karkun Name"
      disabled
      initialValue={userById.karkun ? userById.karkun.sharedData?.name : ''}
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
          disabled={!!userById.username}
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
          fieldLabel="Email"
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
            extra={createChatAccountButton}
          />
        </Space>
      </Form>
    </div>
  );
};

export default GeneralInfo;
