import React from 'react';
import PropTypes from 'prop-types';

import { get, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import DutyShifts from './duty-shifts';

const AntTabs = Tabs as any;
const TabPane = (Tabs as any).TabPane;
type AnyProps = Record<string, any>;

const EditForm = (props: AnyProps) => {
  const { match, queryParams } = props;
  const dutyId = get(match, 'params.dutyId', null) as string | null;
  const activeKey = (queryParams?.['default-active-tab'] as string | undefined) || '1';
  return (
    <AntTabs defaultActiveKey={activeKey}>
      <TabPane tab="General Info" key="1">
        <GeneralInfo dutyId={dutyId} {...props} />
      </TabPane>
      <TabPane tab="Shifts" key="2">
        <DutyShifts dutyId={dutyId} {...props} />
      </TabPane>
    </AntTabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object,
};

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Duties & Shifts', 'Edit'])
)(EditForm as any);
