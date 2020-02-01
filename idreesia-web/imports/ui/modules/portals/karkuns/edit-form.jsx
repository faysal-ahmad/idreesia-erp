import React from 'react';
import PropTypes from 'prop-types';

import { get, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { WithPortal } from '/imports/ui/modules/portals/common/composers';
import { Tabs } from '/imports/ui/controls';
import GeneralInfo from './edit/general-info';
import ProfilePicture from './edit/profile-picture';

const EditForm = props => {
  const { match } = props;
  const portalId = get(match, 'params.portalId', null);
  const karkunId = get(match, 'params.karkunId', null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo portalId={portalId} karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Profile Picture" key="2">
        <ProfilePicture portalId={portalId} karkunId={karkunId} {...props} />
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