import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Images from './images';

const EditForm = props => {
  const wazeefaId = get(props, ['match', 'params', 'wazeefaId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo wazeefaId={wazeefaId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Images" key="2">
        <Images wazeefaId={wazeefaId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Operations', 'Wazaif', 'Edit'])(EditForm);
