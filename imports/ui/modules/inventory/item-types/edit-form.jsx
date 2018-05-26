import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Tabs } from 'antd';

import { WithBreadcrumbs } from '/imports/ui/composers';
import GeneralInfo from './edit/general-info';
import Picture from './edit/picture';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object
  };

  render() {
    const itemTypeId = get(this.props, ['match', 'params', 'itemTypeId'], null);
    return (
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="General Info" key="1">
          <GeneralInfo itemTypeId={itemTypeId} {...this.props} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Picture" key="2">
          <Picture itemTypeId={itemTypeId} {...this.props} />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}

export default WithBreadcrumbs(['Inventory', 'Setup', 'Item Types', 'Edit'])(EditForm);
