import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { get } from 'lodash';
import { Tabs } from 'antd';

import { WithBreadcrumbs } from '/imports/ui/composers';
import GeneralInfo from './edit/general-info';
import Permissions from './edit/permissions';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object
  };

  render() {
    const karkunId = get(this.props, ['match', 'params', 'karkunId'], null);
    return (
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="General Info" key="1">
          <GeneralInfo karkunId={karkunId} {...this.props} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Permissions" key="2">
          <Permissions karkunId={karkunId} {...this.props} />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}

export default WithBreadcrumbs(['Admin', 'Setup', 'Account', 'Edit'])(EditForm);
