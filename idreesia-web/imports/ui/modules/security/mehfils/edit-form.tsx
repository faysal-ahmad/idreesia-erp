import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import { MehfilKarkuns } from '../mehfil-karkuns';
import GeneralInfo from './edit/general-info';

const TabPane = Tabs.TabPane;
type Props = RouteComponentProps<{ mehfilId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const { mehfilId } = match.params;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['Security', 'Mehfils', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';

  return (
    <Tabs defaultActiveKey={activeKey}>
      <TabPane tab="General Info" key="1">
        <GeneralInfo mehfilId={mehfilId} history={history} />
      </TabPane>
      <TabPane tab="Karkuns" key="2">
        <MehfilKarkuns
          mehfilId={mehfilId}
          history={history}
          location={location}
        />
      </TabPane>
    </Tabs>
  );
};

export default EditForm;
