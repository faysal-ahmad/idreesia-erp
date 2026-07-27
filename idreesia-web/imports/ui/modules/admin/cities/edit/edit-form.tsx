import React from 'react';
import PropTypes from 'prop-types';

import { get, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import CityMehfils from './city-mehfils';

const AntTabs = Tabs as any;
const TabPane = (Tabs as any).TabPane;
const GeneralInfoForm = GeneralInfo as any;
const CityMehfilsList = CityMehfils as any;
type AnyProps = Record<string, any>;

const EditForm = (props: AnyProps) => {
  const { match, queryParams } = props;
  const cityId = get(match, 'params.cityId', null);
  const activeKey = queryParams['default-active-tab'] || '1';
  return (
    <AntTabs defaultActiveKey={activeKey}>
      <TabPane tab="General Info" key="1">
        <GeneralInfoForm cityId={cityId} {...props} />
      </TabPane>
      <TabPane tab="Mehfils" key="2">
        <CityMehfilsList cityId={cityId} {...props} />
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
  WithBreadcrumbs(['Admin', 'Locations Management', 'Cities & Mehfils', 'Edit'])
)(EditForm as any);
