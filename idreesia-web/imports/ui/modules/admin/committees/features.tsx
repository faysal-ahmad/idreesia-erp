import React, { useEffect, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Alert, Button, Modal, Space, Spin, Switch, Table } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';

import { CommitteeFeatureCategories } from 'meteor/idreesia-common/constants/organization';

import type {
  AllCommitteeFeaturesQuery,
  AllCommitteeFeaturesQueryVariables,
  DisableCommitteeFeatureMutation,
  DisableCommitteeFeatureMutationVariables,
  EnableCommitteeFeatureMutation,
  EnableCommitteeFeatureMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_COMMITTEE_FEATURES: TypedDocumentNode<
  AllCommitteeFeaturesQuery,
  AllCommitteeFeaturesQueryVariables
> = gql`
  query allCommitteeFeatures {
    allCommitteeFeatures {
      key
      name
      description
      category
    }
  }
`;

const ENABLE_COMMITTEE_FEATURE: TypedDocumentNode<
  EnableCommitteeFeatureMutation,
  EnableCommitteeFeatureMutationVariables
> = gql`
  mutation enableCommitteeFeature($committeeId: String!, $featureKey: String!) {
    enableCommitteeFeature(committeeId: $committeeId, featureKey: $featureKey)
  }
`;

const DISABLE_COMMITTEE_FEATURE: TypedDocumentNode<
  DisableCommitteeFeatureMutation,
  DisableCommitteeFeatureMutationVariables
> = gql`
  mutation disableCommitteeFeature(
    $committeeId: String!
    $featureKey: String!
  ) {
    disableCommitteeFeature(committeeId: $committeeId, featureKey: $featureKey)
  }
`;

interface FeatureRow {
  key: string;
  name: string;
  description: string | null;
  category: string | null;
}

const UNCATEGORIZED = 'Other';
const CATEGORY_ORDER: string[] = [
  ...Object.values(CommitteeFeatureCategories),
  UNCATEGORIZED,
];

const categoryOf = (feature: FeatureRow) => feature.category || UNCATEGORIZED;

// Orders features by category (keeping their original order within a
// category) and works out how many rows each category cell should span.
const groupByCategory = (features: FeatureRow[]) => {
  const sorted = features
    .map((feature, index) => ({ feature, index }))
    .sort((a, b) => {
      const rankA = CATEGORY_ORDER.indexOf(categoryOf(a.feature));
      const rankB = CATEGORY_ORDER.indexOf(categoryOf(b.feature));
      const byCategory =
        (rankA === -1 ? CATEGORY_ORDER.length : rankA) -
        (rankB === -1 ? CATEGORY_ORDER.length : rankB);
      if (byCategory !== 0) return byCategory;
      const byName = categoryOf(a.feature).localeCompare(categoryOf(b.feature));
      return byName !== 0 ? byName : a.index - b.index;
    })
    .map(({ feature }) => feature);

  const rowSpans = new Map<string, number>();
  sorted.forEach((feature, index) => {
    const isFirstInCategory =
      index === 0 || categoryOf(sorted[index - 1]) !== categoryOf(feature);
    if (!isFirstInCategory) {
      rowSpans.set(feature.key, 0);
      return;
    }
    let span = 1;
    while (
      index + span < sorted.length &&
      categoryOf(sorted[index + span]) === categoryOf(feature)
    ) {
      span += 1;
    }
    rowSpans.set(feature.key, span);
  });

  return { sorted, rowSpans };
};

interface Props {
  committeeId: string;
  enabledFeatures: string[];
}

const Features = ({ committeeId, enabledFeatures }: Props) => {
  const [draft, setDraft] = useState<string[]>(enabledFeatures);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const { data, loading } = useQuery(ALL_COMMITTEE_FEATURES);
  const mutationOptions = {
    refetchQueries: ['committeeById', 'myCommittees'],
    awaitRefetchQueries: true,
  };
  const [enableCommitteeFeature] = useMutation(
    ENABLE_COMMITTEE_FEATURE,
    mutationOptions
  );
  const [disableCommitteeFeature] = useMutation(
    DISABLE_COMMITTEE_FEATURE,
    mutationOptions
  );

  // Start over from what is saved whenever the committee's features change.
  const savedKey = [...enabledFeatures].sort().join(',');
  useEffect(() => {
    setDraft(enabledFeatures);
  }, [savedKey]);

  const { sorted: features, rowSpans } = groupByCategory(
    (data?.allCommitteeFeatures ?? []).filter(
      (feature): feature is FeatureRow =>
        feature?.key != null && feature.name != null
    )
  );

  const toEnable = features.filter(
    f => draft.includes(f.key) && !enabledFeatures.includes(f.key)
  );
  const toDisable = features.filter(
    f => !draft.includes(f.key) && enabledFeatures.includes(f.key)
  );
  const hasChanges = toEnable.length + toDisable.length > 0;

  const handleToggle = (feature: FeatureRow, enabled: boolean) => {
    setDraft(prev =>
      enabled
        ? [...prev, feature.key]
        : prev.filter(key => key !== feature.key)
    );
  };

  const applyChanges = async () => {
    setSaving(true);
    setSaveError(null);
    const failures: string[] = [];
    const steps = [
      ...toDisable.map(f => ({ feature: f, enable: false })),
      ...toEnable.map(f => ({ feature: f, enable: true })),
    ];
    for (const { feature, enable } of steps) {
      const mutate = enable ? enableCommitteeFeature : disableCommitteeFeature;
      try {
        await mutate({ variables: { committeeId, featureKey: feature.key } });
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
      title: 'Apply these feature changes to this committee?',
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
    {
      title: 'Category',
      key: 'category',
      width: 160,
      render: (_text: unknown, feature: FeatureRow) => categoryOf(feature),
      onCell: (feature: FeatureRow) => ({
        rowSpan: rowSpans.get(feature.key) ?? 1,
      }),
    },
    {
      title: 'Feature',
      dataIndex: 'name',
      key: 'name',
      width: 220,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Enabled',
      key: 'enabled',
      width: 100,
      render: (_text: unknown, feature: FeatureRow) => (
        <Switch
          checked={draft.includes(feature.key)}
          disabled={saving}
          onChange={checked => handleToggle(feature, checked)}
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

export default Features;
