import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import MehfilDuties from './mehfil-duties';

type Props = RouteComponentProps;

const TAB_DUTIES = 'duties';

// Data shared by every mehfil location. Each kind of data is a tab.
const List = ({ history, location }: Props) => {
  useBreadcrumbs(['Admin', 'Mehfil Templates']);

  const { setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab'],
    paramDefaultValues: { 'default-active-tab': TAB_DUTIES },
  });

  return (
    <Tabs
      activeKey={TAB_DUTIES}
      onChange={key => setPageParams({ 'default-active-tab': key })}
      items={[
        { key: TAB_DUTIES, label: 'Mehfil Duties', children: <MehfilDuties /> },
      ]}
    />
  );
};

export default List;
