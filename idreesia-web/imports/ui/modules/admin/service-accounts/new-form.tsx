import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Collapse, Form, Space, type CollapseProps } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { CREATE_SERVICE_ACCOUNT, PAGED_USERS } from '../users/gql';

interface FormValues {
  userName?: string;
  displayName?: string;
}

const NewForm = ({ history }: RouteComponentProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  useBreadcrumbs(['Admin', 'Service Accounts', 'New']);
  const [createServiceAccount] = useMutation(CREATE_SERVICE_ACCOUNT, {
    refetchQueries: [
      {
        query: PAGED_USERS,
        variables: { filter: { serviceAccounts: 'true' } },
      },
    ],
  });

  const handleFinish = ({ userName, displayName }: FormValues) => {
    createServiceAccount({
      variables: { userName: userName ?? '', displayName },
    })
      .then(result => {
        message.success('Service account created', 2);
        const newId = result.data?.createServiceAccount?._id;
        history.push(
          newId
            ? `${paths.serviceAccountsPath}/${newId}`
            : paths.serviceAccountsPath
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const accountItem: NonNullable<CollapseProps['items']>[number] = {
    key: 'account',
    label: 'Account Information',
    forceRender: true,
    children: (
      <>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          required
          requiredMessage="Please input a user name"
        />
        <InputTextField fieldName="displayName" fieldLabel="Display name" />
      </>
    ),
  };

  return (
    <div className="visitor-form">
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={() => setIsFieldsTouched(true)}
      >
        <Space orientation="vertical" size={16} style={{ display: 'flex', width: '100%' }}>
          <Collapse
            className="visitor-form-sections"
            defaultActiveKey={['account']}
            items={[accountItem]}
          />

          <FormButtonsSaveCancel
            handleCancel={() => history.push(paths.serviceAccountsPath)}
            isFieldsTouched={isFieldsTouched}
            fullWidth
          />
        </Space>
      </Form>
    </div>
  );
};

export default NewForm;
