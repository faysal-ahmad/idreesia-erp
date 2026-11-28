import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import { EventKarkuns } from '../event-karkuns';
import GeneralInfo from './edit/general-info';

type Props = RouteComponentProps<{ eventId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const { eventId } = match.params;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['Security', 'Events', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';

  return (
    <Tabs
      defaultActiveKey={activeKey}
      items={[
        {
          key: '1',
          label: 'General Info',
          children: <GeneralInfo eventId={eventId} history={history} />,
        },
        {
          key: '2',
          label: 'Karkuns',
          children: (
            <EventKarkuns
              eventId={eventId}
              history={history}
              location={location}
            />
          ),
        },
      ]}
    />
  );
};

export default EditForm;
