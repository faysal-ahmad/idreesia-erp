import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { SettingOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Dropdown,
  Form,
  Popconfirm,
  Space,
  Spin,
  Tooltip,
  type CollapseProps,
  type MenuProps,
} from 'antd';
import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import { message, modal } from '/imports/ui/antd-feedback';
import {
  InputTextField,
  SwitchField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import ResetPasswordModal from './reset-password-modal';
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
  email?: string;
  displayName?: string;
  locked?: boolean;
}

const GeneralInfo = ({ userId, history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
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
    history.push(
      userById?.isServiceAccount ? paths.serviceAccountsPath : paths.usersPath
    );
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    userName,
    email,
    displayName,
    locked,
  }: FormValues) => {
    updateUser({
      variables: {
        userId: userById?._id ?? userId,
        // A user name can only be set once; after that the field is locked.
        userName: !userById?.username && userName ? userName : undefined,
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

  // Commands in the cog menus on the section headers. Every command is always
  // listed; one that doesn't apply is disabled, with the reason as a tooltip.
  const isSuperAdminCaller = !!loggedInUser?.isSuperAdmin;
  const SUPER_ADMIN_ONLY = 'Only a super admin can do this';

  const commandItem = (
    key: string,
    text: string,
    disabledReason: string | undefined,
    onClick: () => void,
    busy = false
  ): NonNullable<MenuProps['items']>[number] => ({
    key,
    label: <Tooltip title={disabledReason}>{text}</Tooltip>,
    disabled: !!disabledReason || busy,
    onClick,
  });

  // Super admin rights can only be granted to a user who has two-factor
  // authentication enabled and is not locked.
  let makeSuperAdminReason: string | undefined;
  if (!isSuperAdminCaller) makeSuperAdminReason = SUPER_ADMIN_ONLY;
  else if (userById.isServiceAccount)
    makeSuperAdminReason = 'A service account cannot be a super admin';
  else if (userById.locked)
    makeSuperAdminReason = 'A locked user cannot be made a super admin';
  else if (!userById.twoFactorEnabled)
    makeSuperAdminReason = 'The user must enable two-factor authentication first';

  let createChatAccountReason: string | undefined;
  if (userById.hasChatAccount) {
    createChatAccountReason = 'This user already has a chat account';
  } else if (!canCreateChatAccount) {
    createChatAccountReason = 'Set and save a user name and display name first';
  }

  let resetPasswordReason: string | undefined;
  if (!isSuperAdminCaller) {
    resetPasswordReason = SUPER_ADMIN_ONLY;
  } else if (userById.isServiceAccount) {
    resetPasswordReason = 'A service account has no password';
  }

  const settingsItems: NonNullable<MenuProps['items']> = [
    commandItem(
      'create-chat-account',
      'Create Chat Account',
      createChatAccountReason,
      handleCreateChatAccount,
      creatingChatAccount
    ),
    commandItem(
      'reset-password',
      'Reset Password',
      resetPasswordReason,
      () => setResetPasswordOpen(true)
    ),
    userById.isSuperAdmin
      ? commandItem(
          'remove-super-admin',
          'Remove Super Admin',
          isSuperAdminCaller ? undefined : SUPER_ADMIN_ONLY,
          () =>
            modal.confirm({
              title: 'Remove super admin rights from this user?',
              content: 'They will keep only the permissions granted to them.',
              okText: 'Remove',
              onOk: () => handleSetSuperAdmin(false),
            }),
          settingSuperAdmin
        )
      : commandItem(
          'make-super-admin',
          'Make Super Admin',
          makeSuperAdminReason,
          () =>
            modal.confirm({
              title: 'Make this user a super admin?',
              content:
                'They will have every permission and access to every instance and committee.',
              okText: 'Make Super Admin',
              onOk: () => handleSetSuperAdmin(true),
            }),
          settingSuperAdmin
        ),
  ];

  // For a user who lost the phone with their authenticator app; they can then
  // log in with only their password and set it up again.
  let resetTwoFactorReason: string | undefined;
  if (!isSuperAdminCaller) resetTwoFactorReason = SUPER_ADMIN_ONLY;
  else if (userById.isServiceAccount)
    resetTwoFactorReason = 'A service account does not use two-factor authentication';
  else if (!userById.twoFactorEnabled)
    resetTwoFactorReason = 'Two-factor authentication is not enabled for this user';

  const statusItems: NonNullable<MenuProps['items']> = [
    commandItem(
      'reset-two-factor',
      'Reset Two-Factor',
      resetTwoFactorReason,
      () =>
        modal.confirm({
          title: 'Turn off two-factor authentication for this user?',
          content: 'They will be able to log in with only their password.',
          okText: 'Turn Off',
          onOk: handleResetTwoFactor,
        }),
      resettingTwoFactor
    ),
  ];

  const cogMenu = (items: NonNullable<MenuProps['items']>, title: string) => (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button
        type="text"
        icon={<SettingOutlined />}
        title={title}
        // Keep the click from collapsing the section.
        onClick={event => event.stopPropagation()}
      />
    </Dropdown>
  );
  const statusMenu = cogMenu(statusItems, 'Status commands');
  const settingsMenu = cogMenu(settingsItems, 'Account commands');

  const extraButtons = clearLoginBlocksButton ? (
    <Space>{clearLoginBlocksButton}</Space>
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
    extra: settingsMenu,
    forceRender: true,
    children: (
      <>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled={!!userById.username}
          initialValue={userById.username}
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

        {/* Read-only; empty until a chat account is created. */}
        <Form.Item
          label="Chat User ID"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
        >
          {userById.chatUserId || '-'}
        </Form.Item>

        <Form.Item
          label="Super Admin"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
        >
          {userById.isSuperAdmin ? 'Yes' : 'No'}
        </Form.Item>

        {/* Only worth showing on a service account; a user is never one. */}
        {userById.isServiceAccount ? (
          <Form.Item
            label="Service Account"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            Yes
          </Form.Item>
        ) : null}
      </>
    ),
  };

  const statusItem: NonNullable<CollapseProps['items']>[number] = {
    key: 'status',
    label: 'Account Status',
    extra: statusMenu,
    forceRender: true,
    children: (
      <>
        <SwitchField
          fieldName="locked"
          fieldLabel="Locked"
          initialValue={userById.locked ?? undefined}
        />

        {/* A service account can't log in, so two-factor doesn't apply. */}
        {userById.isServiceAccount ? null : (
          <Form.Item
            label="Two-Factor"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            {userById.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
          </Form.Item>
        )}

        <Form.Item
          label="Login"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
        >
          {isLoginBlocked ? loginBlockStatus : 'Not blocked'}
        </Form.Item>
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
            defaultActiveKey={['account', 'status']}
            items={[accountItem, statusItem]}
          />

          <FormButtonsSaveCancel
            handleCancel={handleCancel}
            isFieldsTouched={isFieldsTouched}
            fullWidth
            extra={extraButtons}
          />
        </Space>
      </Form>

      <ResetPasswordModal
        userId={userById._id ?? userId}
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
      />
    </div>
  );
};

export default GeneralInfo;
