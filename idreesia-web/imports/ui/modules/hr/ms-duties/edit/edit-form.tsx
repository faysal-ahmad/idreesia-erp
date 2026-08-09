import React from 'react';
import { type RouteComponentProps } from 'react-router';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import DutyShifts from './duty-shifts';

type Props = RouteComponentProps<{ dutyId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const dutyId = match.params.dutyId;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['HR', 'Duties & Shifts', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';

  return (
    <Tabs
      defaultActiveKey={activeKey}
      items={[
        {
          key: '1',
          label: 'General Info',
          children: <GeneralInfo dutyId={dutyId} history={history} />,
        },
        {
          key: '2',
          label: 'Shifts',
          children: <DutyShifts dutyId={dutyId} />,
        },
      ]}
    />
  );
};

export default EditForm;
