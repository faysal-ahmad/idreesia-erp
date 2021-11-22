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

const EditForm = props => {
  const { match, queryParams } = props;
  const dutyId = get(match, 'params.dutyId', null);
  const activeKey = queryParams['default-active-tab'] || '1';
  return (
    <Tabs defaultActiveKey={activeKey}>
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo dutyId={dutyId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Shifts" key="2">
        <DutyShifts dutyId={dutyId} {...props} />
      </Tabs.TabPane>
    </Tabs>
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
)(EditForm);
