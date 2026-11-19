import React, { useEffect, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Alert, Button, Modal, Space, Spin, Switch, Table } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';

import type {
  AllOrgLocationFeaturesQuery,
  AllOrgLocationFeaturesQueryVariables,
  DisableOrgLocationFeatureMutation,
  DisableOrgLocationFeatureMutationVariables,
  EnableOrgLocationFeatureMutation,
  EnableOrgLocationFeatureMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_ORG_LOCATION_FEATURES: TypedDocumentNode<
  AllOrgLocationFeaturesQuery,
  AllOrgLocationFeaturesQueryVariables
> = gql`
  query allOrgLocationFeatures {
    allOrgLocationFeatures {
      key
      name
      description
    }
  }
`;

const ENABLE_ORG_LOCATION_FEATURE: TypedDocumentNode<
  EnableOrgLocationFeatureMutation,
  EnableOrgLocationFeatureMutationVariables
> = gql`
  mutation enableOrgLocationFeature($locationId: String!, $featureKey: String!) {
    enableOrgLocationFeature(locationId: $locationId, featureKey: $featureKey)
  }
`;

const DISABLE_ORG_LOCATION_FEATURE: TypedDocumentNode<
  DisableOrgLocationFeatureMutation,
  DisableOrgLocationFeatureMutationVariables
> = gql`
  mutation disableOrgLocationFeature(
    $locationId: String!
    $featureKey: String!
  ) {
    disableOrgLocationFeature(locationId: $locationId, featureKey: $featureKey)
  }
`;

interface FeatureRow {
  key: string;
  name: string;
  description: string;
}

interface Props {
  locationId: string;
  enabledFeatures: string[];
}

// Features that can be switched on for a location (mehfils only). Same flow as
// the committee features page: switch, Save, confirm.
const LocationFeatures = ({ locationId, enabledFeatures }: Props) => {
  const [draft, setDraft] = useState<string[]>(enabledFeatures);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const { data, loading } = useQuery(ALL_ORG_LOCATION_FEATURES);
  const mutationOptions = {
    refetchQueries: ['orgLocationById', 'myDutiesAttendanceLocations'],
    awaitRefetchQueries: true,
  };
  const [enableFeature] = useMutation(
    ENABLE_ORG_LOCATION_FEATURE,
    mutationOptions
  );
  const [disableFeature] = useMutation(
    DISABLE_ORG_LOCATION_FEATURE,
    mutationOptions
  );

  // Start over from what is saved whenever the location's features change.
  const savedKey = [...enabledFeatures].sort().join(',');
  useEffect(() => {
    setDraft(enabledFeatures);
  }, [savedKey]);

  const features = (data?.allOrgLocationFeatures ?? []).filter(
    (feature): feature is FeatureRow =>
      feature?.key != null &&
      feature.name != null &&
      feature.description != null
  );

  const toEnable = features.filter(
    f => draft.includes(f.key) && !enabledFeatures.includes(f.key)
  );
  const toDisable = features.filter(
    f => !draft.includes(f.key) && enabledFeatures.includes(f.key)
  );
  const hasChanges = toEnable.length + toDisable.length > 0;

  const applyChanges = async () => {
    setSaving(true);
    setSaveError(null);
    const failures: string[] = [];
    const steps = [
      ...toDisable.map(f => ({ feature: f, enable: false })),
      ...toEnable.map(f => ({ feature: f, enable: true })),
    ];
    for (const { feature, enable } of steps) {
      const mutate = enable ? enableFeature : disableFeature;
      try {
        await mutate({ variables: { locationId, featureKey: feature.key } });
      } catch (error) {
        failures.push(
          `Could not ${enable ? 'enable' : 'disable'} ${feature.name}: ${
            (error as Error).message
          }`
        );
      }
    }
    setSaving(false);
    // Show what actually got saved.
    setDraft(enabledFeatures);
    if (failures.length > 0) {
      setSaveError({
        title:
          failures.length === steps.length
            ? 'The changes could not be saved'
            : 'Some changes could not be saved',
        description: failures.join('\n'),
      });
    } else {
      message.success('Features updated', 2);
    }
  };

  const handleSave = () => {
    Modal.confirm({
      title: 'Apply these feature changes to this location?',
      content: (
        <div>
          {toEnable.length > 0 ? (
            <div>Enable: {toEnable.map(f => f.name).join(', ')}</div>
          ) : null}
          {toDisable.length > 0 ? (
            <div>Disable: {toDisable.map(f => f.name).join(', ')}</div>
          ) : null}
        </div>
      ),
      okText: 'Yes',
      cancelText: 'No',
      onOk: applyChanges,
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    { title: 'Feature', dataIndex: 'name', key: 'name', width: 260 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Enabled',
      key: 'enabled',
      width: 100,
      render: (_text: unknown, feature: FeatureRow) => (
        <Switch
          checked={draft.includes(feature.key)}
          disabled={saving}
          onChange={checked =>
            setDraft(prev =>
              checked
                ? [...prev, feature.key]
                : prev.filter(key => key !== feature.key)
            )
          }
        />
      ),
    },
  ];

  return (
    <div className="list-container">
      {saveError ? (
        <Alert
          type="error"
          showIcon
          closable
          message={saveError.title}
          description={
            <div style={{ whiteSpace: 'pre-line' }}>{saveError.description}</div>
          }
          onClose={() => setSaveError(null)}
          style={{ marginBottom: 12 }}
        />
      ) : null}
      <Table
        className="list-table"
        rowKey="key"
        dataSource={features}
        columns={columns}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        locale={{ emptyText: 'No features available' }}
      />
      <Space
        size={8}
        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}
      >
        <Button
          size="large"
          icon={<CloseCircleOutlined />}
          disabled={!hasChanges || saving}
          onClick={() => setDraft(enabledFeatures)}
        >
          Cancel
        </Button>
        <Button
          size="large"
          type="primary"
          icon={<SaveOutlined />}
          disabled={!hasChanges}
          loading={saving}
          onClick={handleSave}
        >
          Save
        </Button>
      </Space>
    </div>
  );
};

export default LocationFeatures;
