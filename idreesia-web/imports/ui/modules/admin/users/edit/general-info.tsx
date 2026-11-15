import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { MessageOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Form,
  Popconfirm,
  Space,
  Spin,
  Tooltip,
  type CollapseProps,
} from 'antd';
import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
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
  RESET_TWO_FACTOR,
  SET_SUPER_ADMIN,
  CLEAR_LOGIN_BLOCKS,
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
  const [resetTwoFactor, { loading: resettingTwoFactor }] = useMutation(
    RESET_TWO_FACTOR,
    {
      refetchQueries: [{ query: PAGED_USERS, variables: { filter: {} } }],
    }
  );
  const [clearLoginBlocks, { loading: clearingLoginBlocks }] = useMutation(
    CLEAR_LOGIN_BLOCKS
  );
  const [setSuperAdmin, { loading: settingSuperAdmin }] = useMutation(
    SET_SUPER_ADMIN,
    {
      refetchQueries: [
        { query: PAGED_USERS, variables: { filter: {} } },
        'adminUserById',
      ],
    }
  );
  const { user: loggedInUser } = useLoggedInUser();
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

  // For a user who lost the phone with their authenticator app; they can
  // then log in with only their password and set it up again.
  const handleResetTwoFactor = () => {
    resetTwoFactor({ variables: { userId: userById?._id ?? userId } })
      .then(() => {
        message.success('Two-factor authentication turned off', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  // For a user kept locked out by failed login attempts, e.g. someone else
  // trying wrong passwords on their account.
  const handleClearLoginBlocks = () => {
    clearLoginBlocks({ variables: { userId: userById?._id ?? userId } })
      .then(() => {
        message.success('Login blocks cleared', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleSetSuperAdmin = (isSuperAdmin: boolean) => {
    setSuperAdmin({
      variables: { userId: userById?._id ?? userId, isSuperAdmin },
    })
      .then(() => {
        message.success(
          isSuperAdmin ? 'User is now a super admin' : 'Super admin removed',
          2
        );
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

  const resetTwoFactorButton = userById.twoFactorEnabled ? (
    <Popconfirm
      title="Turn off two-factor authentication for this user?"
      description="They will be able to log in with only their password."
      okText="Turn Off"
      onConfirm={handleResetTwoFactor}
    >
      <Button size="large" loading={resettingTwoFactor}>
        Reset Two-Factor
      </Button>
    </Popconfirm>
  ) : null;

  const blockedAddresses = userById.loginBlockedAddresses ?? 0;
  const isLoginBlocked =
    blockedAddresses > 0 || !!userById.untrustedLoginAddressesBlocked;
  const loginBlockStatus = [
    blockedAddresses > 0
      ? `Blocked from ${blockedAddresses} ${blockedAddresses === 1 ? 'address' : 'addresses'}`
      : null,
    userById.untrustedLoginAddressesBlocked
      ? 'Only addresses used before can log in (too many failed attempts)'
      : null,
  ]
    .filter(Boolean)
    .join('. ');

  const clearLoginBlocksButton = isLoginBlocked ? (
    <Popconfirm
      title="Clear this user's login blocks?"
      description="Failed login attempts will no longer block any address."
      okText="Clear"
      onConfirm={handleClearLoginBlocks}
    >
      <Button size="large" loading={clearingLoginBlocks}>
        Clear Login Blocks
      </Button>
    </Popconfirm>
  ) : null;

  // Only a super admin can grant or revoke super admin rights, and only to a
  // user who has two-factor authentication enabled and is not locked.
  let superAdminButton: React.ReactNode = null;
  if (loggedInUser?.isSuperAdmin) {
    if (userById.isSuperAdmin) {
      superAdminButton = (
        <Popconfirm
          title="Remove super admin rights from this user?"
          description="They will keep only the permissions granted to them."
          okText="Remove"
          onConfirm={() => handleSetSuperAdmin(false)}
        >
          <Button size="large" loading={settingSuperAdmin}>
            Remove Super Admin
          </Button>
        </Popconfirm>
      );
    } else {
      let disabledReason: string | undefined;
      if (userById.locked) {
        disabledReason = 'A locked user cannot be made a super admin';
      } else if (!userById.twoFactorEnabled) {
        disabledReason = 'The user must enable two-factor authentication first';
      }
      superAdminButton = (
        <Tooltip title={disabledReason}>
          <Popconfirm
            title="Make this user a super admin?"
            description="They will have every permission and access to every instance and committee."
            okText="Make Super Admin"
            disabled={!!disabledReason}
            onConfirm={() => handleSetSuperAdmin(true)}
          >
            <Button
              size="large"
              disabled={!!disabledReason}
              loading={settingSuperAdmin}
            >
              Make Super Admin
            </Button>
          </Popconfirm>
        </Tooltip>
      );
    }
  }

  const extraButtons =
    createChatAccountButton ||
    resetTwoFactorButton ||
    clearLoginBlocksButton ||
    superAdminButton ? (
      <Space>
        {createChatAccountButton}
        {resetTwoFactorButton}
        {clearLoginBlocksButton}
        {superAdminButton}
      </Space>
    ) : null;

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

        {/* Read-only status (not a form field), so it updates after a reset. */}
        <Form.Item
          label="Two-Factor"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
        >
          {userById.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
        </Form.Item>

        <Form.Item
          label="Login"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
        >
          {isLoginBlocked ? loginBlockStatus : 'Not blocked'}
        </Form.Item>

        <Form.Item
          label="Super Admin"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
        >
          {userById.isSuperAdmin ? 'Yes' : 'No'}
        </Form.Item>

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
            extra={extraButtons}
          />
        </Space>
      </Form>
    </div>
  );
};

export default GeneralInfo;
