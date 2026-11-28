import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Form, InputNumber, Modal } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type {
  HrEmploymentSettingsQuery,
  HrEmploymentSettingsQueryVariables,
  UpdateHrEmploymentSettingsMutation,
  UpdateHrEmploymentSettingsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const HR_EMPLOYMENT_SETTINGS: TypedDocumentNode<
  HrEmploymentSettingsQuery,
  HrEmploymentSettingsQueryVariables
> = gql`
  query hrEmploymentSettings {
    hrEmploymentSettings {
      defaultProbationMonths
    }
  }
`;

const UPDATE_HR_EMPLOYMENT_SETTINGS: TypedDocumentNode<
  UpdateHrEmploymentSettingsMutation,
  UpdateHrEmploymentSettingsMutationVariables
> = gql`
  mutation updateHrEmploymentSettings($defaultProbationMonths: Int!) {
    updateHrEmploymentSettings(
      defaultProbationMonths: $defaultProbationMonths
    ) {
      defaultProbationMonths
    }
  }
`;

interface FormValues {
  defaultProbationMonths: number;
}

/** Toolbar button opening the employment defaults (probation length). */
const EmploymentSettingsButton = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const { data } = useQuery(HR_EMPLOYMENT_SETTINGS);
  const [updateSettings, { loading }] = useMutation(
    UPDATE_HR_EMPLOYMENT_SETTINGS,
    { refetchQueries: ['hrEmploymentSettings'] }
  );

  const handleOpen = () => {
    form.setFieldsValue({
      defaultProbationMonths:
        data?.hrEmploymentSettings?.defaultProbationMonths ?? 3,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      await updateSettings({ variables: values });
      message.success('Settings saved', 2);
      setOpen(false);
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  return (
    <>
      <Button
        icon={<SettingOutlined />}
        onClick={handleOpen}
        title="Employment Settings"
      />
      <Modal
        title="Employment Settings"
        open={open}
        okText="Save"
        confirmLoading={loading}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        forceRender
      >
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="defaultProbationMonths"
            label="Default probation length (months)"
            extra="Pre-fills the probation end when an employee is hired or rejoins on probation."
            rules={[{ required: true, message: 'Please enter the months.' }]}
          >
            <InputNumber min={1} max={24} precision={0} style={{ width: 160 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EmploymentSettingsButton;
