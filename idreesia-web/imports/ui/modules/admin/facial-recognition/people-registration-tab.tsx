import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Collapse, Empty, Form, Space, Spin, type CollapseProps } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';

import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import { FormButtonsSaveCancel } from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import {
  DetectionScoreField,
  FacePoseField,
  MinFaceSizeField,
  SharpnessField,
} from './face-fields';
import {
  ADMIN_PEOPLE_REGISTRATION_IMAGE_SETTINGS,
  UPDATE_ADMIN_PEOPLE_REGISTRATION_IMAGE_SETTINGS,
} from './gql';

interface FormValues {
  minDetectionScore: number;
  minFacePixels: number;
  minSharpness: number;
  minFacePose: number;
}

// Image quality for visitor photos registered in the Security module. No face recognition is
// involved: these decide whether a photo is usable for face search later.
const PeopleRegistrationTab = () => {
  const [form] = Form.useForm<FormValues>();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { user } = useLoggedInUser();
  const { data, loading } = useQuery(ADMIN_PEOPLE_REGISTRATION_IMAGE_SETTINGS);
  const [updateSettings] = useMutation(UPDATE_ADMIN_PEOPLE_REGISTRATION_IMAGE_SETTINGS, {
    refetchQueries: ['adminPeopleRegistrationImageSettings'],
  });

  // Anyone can view the settings; only super admins can change them.
  const canEdit = user?.isSuperAdmin ?? false;
  const settings = data?.adminPeopleRegistrationImageSettings;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!settings) return <Empty description="Settings could not be loaded." />;

  const defaults = settings.defaults;

  const handleFinish = (values: FormValues) => {
    updateSettings({ variables: values })
      .then(() => {
        message.success('People registration settings saved', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleReset = () => {
    if (!defaults) return;
    form.setFieldsValue({
      minDetectionScore: defaults.minDetectionScore ?? undefined,
      minFacePixels: defaults.minFacePixels ?? undefined,
      minSharpness: defaults.minSharpness ?? undefined,
      minFacePose: defaults.minFacePose ?? undefined,
    });
    setIsFieldsTouched(true);
  };

  const sectionItems: CollapseProps['items'] = [
    {
      key: 'quality',
      label: 'Image quality',
      forceRender: true,
      children: (
        <>
          <DetectionScoreField
            initialValue={settings.minDetectionScore}
            disabled={!canEdit}
            source="in the photo"
            defaultValue="0.60"
          />
          <MinFaceSizeField
            initialValue={settings.minFacePixels}
            disabled={!canEdit}
            source="in the photo"
            defaultValue="96"
          />
          <SharpnessField
            initialValue={settings.minSharpness}
            disabled={!canEdit}
            source="in the photo"
            defaultValue="50"
          />
          <FacePoseField
            initialValue={settings.minFacePose}
            disabled={!canEdit}
            source="in the photo"
            defaultValue="60"
          />
        </>
      ),
    },
  ];

  return (
    <div className="visitor-form">
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={() => setIsFieldsTouched(true)}
      >
        <Collapse
          className="visitor-form-sections"
          style={{ marginBottom: 16 }}
          defaultActiveKey={['quality']}
          items={sectionItems}
        />
        {canEdit ? (
          <FormButtonsSaveCancel
            handleCancel={() => {
              form.resetFields();
              setIsFieldsTouched(false);
            }}
            isFieldsTouched={isFieldsTouched}
            fullWidth
            extra={
              <Button size="large" icon={<UndoOutlined />} onClick={handleReset}>
                Reset to defaults
              </Button>
            }
          />
        ) : (
          <Space>Only a super admin can change these settings.</Space>
        )}
      </Form>
      <AuditInfo
        record={{
          updatedAt: settings.updatedAt as string | number | null,
          updatedBy: settings.updatedBy,
        }}
      />
    </div>
  );
};

export default PeopleRegistrationTab;
