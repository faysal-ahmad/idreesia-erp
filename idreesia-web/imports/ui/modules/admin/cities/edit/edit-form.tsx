import React from 'react';
import { type RouteComponentProps } from 'react-router';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import CityMehfils from './city-mehfils';

type Props = RouteComponentProps<{ cityId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const cityId = match.params.cityId;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['Admin', 'Locations Management', 'Cities & Mehfils', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';
  return (
    <Tabs
      defaultActiveKey={activeKey}
      items={[
        {
          key: '1',
          label: 'General Info',
          children: <GeneralInfo cityId={cityId} history={history} />,
        },
        {
          key: '2',
          label: 'Mehfils',
          children: <CityMehfils cityId={cityId} />,
        },
      ]}
    />
  );
};

export default EditForm;
