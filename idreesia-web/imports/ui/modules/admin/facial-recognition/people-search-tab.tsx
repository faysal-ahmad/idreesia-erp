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
  MatchMarginField,
  MatchThresholdField,
  MinFaceSizeField,
  SharpnessField,
} from './face-fields';
import {
  ADMIN_PEOPLE_SEARCH_FACE_SETTINGS,
  UPDATE_ADMIN_PEOPLE_SEARCH_FACE_SETTINGS,
} from './gql';

interface FormValues {
  matchThreshold: number;
  minMatchMargin: number;
  minDetectionScore: number;
  minFacePixels: number;
  minSharpness: number;
  minFacePose: number;
}

// Visitor search by photo in the Security module (web and mobile).
const PeopleSearchTab = () => {
  const [form] = Form.useForm<FormValues>();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { user } = useLoggedInUser();
  const { data, loading } = useQuery(ADMIN_PEOPLE_SEARCH_FACE_SETTINGS);
  const [updateSettings] = useMutation(UPDATE_ADMIN_PEOPLE_SEARCH_FACE_SETTINGS, {
    refetchQueries: ['adminPeopleSearchFaceSettings'],
  });

  // Anyone can view the settings; only super admins can change them.
  const canEdit = user?.isSuperAdmin ?? false;
  const settings = data?.adminPeopleSearchFaceSettings;

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
        message.success('People search settings saved', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleReset = () => {
    if (!defaults) return;
    form.setFieldsValue({
      matchThreshold: defaults.matchThreshold ?? undefined,
      minMatchMargin: defaults.minMatchMargin ?? undefined,
      minDetectionScore: defaults.minDetectionScore ?? undefined,
      minFacePixels: defaults.minFacePixels ?? undefined,
      minSharpness: defaults.minSharpness ?? undefined,
      minFacePose: defaults.minFacePose ?? undefined,
    });
    setIsFieldsTouched(true);
  };

  const sectionItems: CollapseProps['items'] = [
    {
      key: 'match',
      label: 'Match',
      forceRender: true,
      children: (
        <>
          <MatchThresholdField
            initialValue={settings.matchThreshold}
            disabled={!canEdit}
            source="in the search photo"
            defaultValue="0.50"
          />
          <MatchMarginField
            initialValue={settings.minMatchMargin}
            disabled={!canEdit}
            source="in the search photo"
            defaultValue="0 (off)"
            note="Example: with a margin of 0.10, a best score of 0.58 against a runner-up of 0.55 returns no results, while 0.72 against 0.40 returns the matches."
          />
        </>
      ),
    },
    {
      key: 'quality',
      label: 'Image quality',
      forceRender: true,
      children: (
        <>
          <DetectionScoreField
            initialValue={settings.minDetectionScore}
            disabled={!canEdit}
            source="in the search photo"
            defaultValue="0.60"
          />
          <MinFaceSizeField
            initialValue={settings.minFacePixels}
            disabled={!canEdit}
            source="in the search photo"
            defaultValue="96"
          />
          <SharpnessField
            initialValue={settings.minSharpness}
            disabled={!canEdit}
            source="in the search photo"
            defaultValue="50"
          />
          <FacePoseField
            initialValue={settings.minFacePose}
            disabled={!canEdit}
            source="in the search photo"
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
          defaultActiveKey={['match', 'quality']}
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

export default PeopleSearchTab;
