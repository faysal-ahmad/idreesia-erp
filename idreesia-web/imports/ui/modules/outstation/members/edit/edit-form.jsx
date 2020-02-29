import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from '/imports/ui/controls';

import GeneralInfo from './general-info';
import Picture from './picture';

const EditForm = props => {
  const memberId = get(props, ['match', 'params', 'memberId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo memberId={memberId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Picture" key="2">
        <Picture memberId={memberId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Outstation', 'Members', 'Edit'])(EditForm);
