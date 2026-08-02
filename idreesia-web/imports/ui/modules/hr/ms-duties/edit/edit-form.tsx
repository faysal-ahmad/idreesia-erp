import React from 'react';
import { type RouteComponentProps } from 'react-router';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import DutyShifts from './duty-shifts';

const TabPane = Tabs.TabPane;
type Props = RouteComponentProps<{ dutyId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const dutyId = match.params.dutyId;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['HR', 'Duties & Shifts', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';

  return (
    <Tabs defaultActiveKey={activeKey}>
      <TabPane tab="General Info" key="1">
        <GeneralInfo dutyId={dutyId} history={history} />
      </TabPane>
      <TabPane tab="Shifts" key="2">
        <DutyShifts dutyId={dutyId} />
      </TabPane>
    </Tabs>
  );
};

export default EditForm;
