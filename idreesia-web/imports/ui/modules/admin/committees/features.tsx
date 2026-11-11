import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Alert, Popconfirm, Spin, Switch, Table } from 'antd';
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
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<{
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

  const { sorted: features, rowSpans } = groupByCategory(
    (data?.allCommitteeFeatures ?? []).filter(
      (feature): feature is FeatureRow =>
        feature?.key != null && feature.name != null
    )
  );

  const handleToggle = (feature: FeatureRow, enabled: boolean) => {
    const action = enabled ? 'enable' : 'disable';
    const mutate = enabled ? enableCommitteeFeature : disableCommitteeFeature;
    setPendingKey(feature.key);
    setToggleError(null);
    mutate({ variables: { committeeId, featureKey: feature.key } })
      .then(() => {
        message.success(`${feature.name} ${action}d`, 2);
      })
      .catch((error: Error) => {
        setToggleError({
          title: `Could not ${action} ${feature.name}`,
          description: error.message,
        });
      })
      .finally(() => {
        setPendingKey(null);
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
      render: (_text: unknown, feature: FeatureRow) => {
        const isEnabled = enabledFeatures.includes(feature.key);
        return (
          <Popconfirm
            title={`${isEnabled ? 'Disable' : 'Enable'} ${feature.name} for this committee?`}
            onConfirm={() => handleToggle(feature, !isEnabled)}
            okText="Yes"
            cancelText="No"
            disabled={pendingKey != null}
          >
            <Switch checked={isEnabled} loading={pendingKey === feature.key} />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div className="list-container">
      {toggleError ? (
        <Alert
          type="error"
          showIcon
          closable
          message={toggleError.title}
          description={toggleError.description}
          onClose={() => setToggleError(null)}
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
    </div>
  );
};

export default Features;
