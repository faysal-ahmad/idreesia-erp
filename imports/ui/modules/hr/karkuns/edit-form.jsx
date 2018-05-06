import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { get } from 'lodash';
import { Tabs } from 'antd';

import { WithBreadcrumbs } from '/imports/ui/composers';
import GeneralInfo from './edit/general-info';
import ProfilePicture from './edit/profile-picture';
import DutyParticipation from './edit/duty-participations';

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
        <Tabs.TabPane tab="Profile Picture" key="2">
          <ProfilePicture karkunId={karkunId} {...this.props} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Duty Participation" key="3">
          <DutyParticipation karkunId={karkunId} {...this.props} />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}

export default WithBreadcrumbs(['HR', 'Karkuns', 'Edit'])(EditForm);
