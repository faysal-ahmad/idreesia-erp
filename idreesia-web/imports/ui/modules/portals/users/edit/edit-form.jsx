import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Tabs } from 'antd';
import { useQuery } from '@apollo/react-hooks';

import { usePortal } from 'meteor/idreesia-common/hooks/portals';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';

import GeneralInfo from './general-info';
import Permissions from './permissions';
import { PORTAL_USER_BY_ID } from '../gql';

const EditForm = props => {
  const { location } = props;
  const { portalId, userId } = useParams();
  const { portal } = usePortal();
  const dispatch = useDispatch();

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Users', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Users', 'Edit']));
    }
  }, [location, portalId]);

  const { data } = useQuery(PORTAL_USER_BY_ID, {
    variables: {
      portalId,
      _id: userId,
    },
  });
  
  if (!data?.portalUserById) return null;

  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo
          portalId={portalId}
          userId={userId}
          portalUserById={data.portalUserById}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Permissions" key="2">
        <Permissions
          portalId={portalId}
          userId={userId}
          portalUserById={data.portalUserById}
          {...props}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
