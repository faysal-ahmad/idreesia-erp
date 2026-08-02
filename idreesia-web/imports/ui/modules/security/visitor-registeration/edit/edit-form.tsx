import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Tabs } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';

import GeneralInfo from './general-info';
import Picture from './picture';
import Notes from './notes';
import { SECURITY_VISITOR_BY_ID } from '../gql';

const TabPane = Tabs.TabPane;

type Props = RouteComponentProps<{ visitorId: string }>;

const EditForm = ({ history, match }: Props) => {
  const visitorId = match.params.visitorId;
  useBreadcrumbs(['Security', 'Visitor Registration', 'Edit']);

  const { data, loading } = useQuery(SECURITY_VISITOR_BY_ID, {
    variables: { _id: visitorId },
  });

  const securityVisitorById = data?.securityVisitorById;
  if (loading || !securityVisitorById) return null;

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="General Info" key="1">
        <GeneralInfo
          history={history}
          visitorId={visitorId}
          securityVisitorById={securityVisitorById}
        />
      </TabPane>
      <TabPane tab="Picture" key="2">
        <Picture
          visitorId={visitorId}
          securityVisitorById={securityVisitorById}
        />
      </TabPane>
      <TabPane tab="Notes" key="3">
        <Notes
          history={history}
          securityVisitorById={securityVisitorById}
        />
      </TabPane>
      <TabPane tab="Stay History" key="4">
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
