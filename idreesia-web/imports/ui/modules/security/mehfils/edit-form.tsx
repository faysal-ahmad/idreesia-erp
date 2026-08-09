import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import { MehfilKarkuns } from '../mehfil-karkuns';
import GeneralInfo from './edit/general-info';

type Props = RouteComponentProps<{ mehfilId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const { mehfilId } = match.params;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['Security', 'Mehfils', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';

  return (
    <Tabs
      defaultActiveKey={activeKey}
      items={[
        {
          key: '1',
          label: 'General Info',
          children: <GeneralInfo mehfilId={mehfilId} history={history} />,
        },
        {
          key: '2',
          label: 'Karkuns',
          children: (
            <MehfilKarkuns
              mehfilId={mehfilId}
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
