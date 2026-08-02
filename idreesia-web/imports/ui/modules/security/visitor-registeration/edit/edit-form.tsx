import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Empty, Spin, Tabs } from 'antd';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';

import GeneralInfo from './general-info';
import { SECURITY_VISITOR_BY_ID } from '../gql';

const TabPane = Tabs.TabPane;

type Props = RouteComponentProps<{ visitorId: string }>;

const TAB_GENERAL = 'general';
const TAB_STAYS = 'stays';
const VALID_TAB_KEYS = new Set([TAB_GENERAL, TAB_STAYS]);

const normalizeTabKey = (key: string) => {
  // Current keys, plus legacy numeric URLs from earlier tab layouts
  if (key === TAB_GENERAL || key === '1') return TAB_GENERAL;
  if (key === TAB_STAYS || key === '3' || key === '4') return TAB_STAYS;
  // Legacy key 2 was Picture (now part of General Info)
  if (key === '2') return TAB_GENERAL;
  return VALID_TAB_KEYS.has(key) ? key : TAB_GENERAL;
};

const EditForm = ({ history, location, match }: Props) => {
  const visitorId = match.params.visitorId;
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab'],
    paramDefaultValues: { 'default-active-tab': TAB_GENERAL },
  });

  const activeKey = normalizeTabKey(
    String(queryParams['default-active-tab'] || TAB_GENERAL)
  );

  const { data, loading } = useQuery(SECURITY_VISITOR_BY_ID, {
    variables: { _id: visitorId },
  });

  const securityVisitorById = data?.securityVisitorById;
  const visitorName = securityVisitorById?.name?.trim();

  useDynamicBreadcrumbs([
    'Security',
    'Visitor Registration',
    visitorName || 'Edit',
  ]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!securityVisitorById) {
    return (
      <Empty
        description="Visitor not found"
        style={{ padding: '80px 0' }}
      />
    );
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={(key) => {
        setPageParams({ 'default-active-tab': key });
      }}
    >
      <TabPane tab="General Info" key={TAB_GENERAL}>
        <GeneralInfo
          history={history}
          visitorId={visitorId}
          securityVisitorById={securityVisitorById}
        />
      </TabPane>
      <TabPane tab="Stay History" key={TAB_STAYS}>
        <VisitorStaysList
          visitorId={visitorId}
          showNewButton
          showDutyColumn
          showActionsColumn
        />
      </TabPane>
    </Tabs>
  );
};

export default EditForm;
