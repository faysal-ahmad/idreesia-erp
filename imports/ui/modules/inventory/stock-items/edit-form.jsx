import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Tabs } from 'antd';

import { WithBreadcrumbs } from '/imports/ui/composers';
import GeneralInfo from './edit/general-info';
import IssuanceForms from './edit/issuance-forms';
import ReturnForms from './edit/return-forms';
import Adjustments from './edit/adjustments';

const EditForm = props => {
  const stockItemId = get(props, ['match', 'params', 'stockItemId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Issuance Forms" key="2">
        <IssuanceForms stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Return Forms" key="3">
        <ReturnForms stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Adjustments" key="4">
        <Adjustments stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Inventory', 'Stock Items', 'Edit'])(EditForm);
