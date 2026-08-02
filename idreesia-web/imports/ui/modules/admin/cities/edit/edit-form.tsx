import React from 'react';
import { type RouteComponentProps } from 'react-router';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import CityMehfils from './city-mehfils';

const TabPane = Tabs.TabPane;
type Props = RouteComponentProps<{ cityId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const cityId = match.params.cityId;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['Admin', 'Locations Management', 'Cities & Mehfils', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';
  return (
    <Tabs defaultActiveKey={activeKey}>
      <TabPane tab="General Info" key="1">
        <GeneralInfo cityId={cityId} history={history} />
      </TabPane>
      <TabPane tab="Mehfils" key="2">
        <CityMehfils cityId={cityId} />
      </TabPane>
    </Tabs>
  );
};

export default EditForm;
