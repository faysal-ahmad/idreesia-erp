import React from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { type RouteComponentProps } from 'react-router';
import { Empty, Spin, Tabs } from 'antd';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type {
  CommitteeByIdQuery,
  CommitteeByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import GeneralInfo from './general-info';
import Features from './features';

const COMMITTEE_BY_ID: TypedDocumentNode<
  CommitteeByIdQuery,
  CommitteeByIdQueryVariables
> = gql`
  query committeeById($id: String!) {
    committeeById(id: $id) {
      _id
      name
      color
      description
      features
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

type Props = RouteComponentProps<{ committeeId: string }>;

const TAB_GENERAL = 'general';
const TAB_FEATURES = 'features';
const VALID_TAB_KEYS = new Set([TAB_GENERAL, TAB_FEATURES]);

const EditForm = ({ history, location, match }: Props) => {
  const committeeId = match.params.committeeId;
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab'],
    paramDefaultValues: { 'default-active-tab': TAB_GENERAL },
  });

  const requestedTab = String(queryParams['default-active-tab'] || TAB_GENERAL);
  const activeKey = VALID_TAB_KEYS.has(requestedTab) ? requestedTab : TAB_GENERAL;

  const { loading, data } = useQuery(COMMITTEE_BY_ID, {
    variables: { id: committeeId },
  });
  const committeeById = data?.committeeById;
  const committeeName = committeeById?.name?.trim();

  useDynamicBreadcrumbs(['HR', 'Committees', committeeName || 'Edit']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!committeeById?._id) {
    return (
      <Empty description="Committee not found" style={{ padding: '80px 0' }} />
    );
  }

  const enabledFeatures = (committeeById.features ?? []).filter(
    (key): key is string => key != null
  );

  return (
    <Tabs
      activeKey={activeKey}
      onChange={key => {
        setPageParams({ 'default-active-tab': key });
      }}
      items={[
        {
          key: TAB_GENERAL,
          label: 'General Info',
          children: (
            <GeneralInfo
              history={history}
              committeeId={committeeById._id}
              committee={committeeById}
            />
          ),
        },
        {
          key: TAB_FEATURES,
          label: 'Features',
          children: (
            <Features
              committeeId={committeeById._id}
              enabledFeatures={enabledFeatures}
            />
          ),
        },
      ]}
    />
  );
};

export default EditForm;
