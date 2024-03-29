import React from 'react';
import PropTypes from 'prop-types';

import { get, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { WithPortal } from '/imports/ui/modules/portals/common/composers';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import WazaifAndRaabta from './wazaif-and-raabta';
import ProfilePicture from './profile-picture';
import DutyParticipation from './duty-participation';
import AttendanceSheets from './attendance-sheets';

const EditForm = props => {
  const { match } = props;
  const portalId = get(match, 'params.portalId', null);
  const karkunId = get(match, 'params.karkunId', null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo portalId={portalId} karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Wazaif &amp; Raabta" key="2">
        <WazaifAndRaabta portalId={portalId} karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Profile Picture" key="3">
        <ProfilePicture portalId={portalId} karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Duty Participation" key="4">
        <DutyParticipation portalId={portalId} karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Attendance Sheets" key="5">
        <AttendanceSheets portalId={portalId} karkunId={karkunId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default flowRight(
  WithPortal(),
  WithDynamicBreadcrumbs(({ portal }) => {
    if (portal) {
      return `Mehfil Portal, ${portal.name}, Karkuns, Edit`;
    }
    return `Mehfil Portal, Karkuns, Edit`;
  })
)(EditForm);
