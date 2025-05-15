import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, Result, Tabs } from 'antd';
import { useQuery } from '@apollo/react-hooks';

import { usePortal } from 'meteor/idreesia-common/hooks/portals';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';

import GeneralInfo from './general-info';
import WazaifAndRaabta from './wazaif-and-raabta';
import ProfilePicture from './profile-picture';
import DutyParticipation from './duty-participation';
import AttendanceSheets from './attendance-sheets';

import { PORTAL_KARKUN_BY_ID } from '../gql';

const EditForm = props => {
  const { location, history } = props;
  const { portalId, karkunId } = useParams();
  const { portal } = usePortal();
  const dispatch = useDispatch();

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Karkuns', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Karkuns', 'Edit']));
    }
  }, [location, portalId]);

  const { data, loading } = useQuery(PORTAL_KARKUN_BY_ID, {
    variables: {
      portalId,
      _id: karkunId,
    },
  });
  
  if (loading) return null;
  if (!data?.portalKarkunById) return (
    <Result
        status="warning"
        title="Karkun was not found in the portal."
        extra={
          <Button type="primary" onClick={() => { history.goBack(); }}>
            Go Back
          </Button>
        }
      />
   );

  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo
          portalId={portalId}
          karkunId={karkunId}
          portalKarkunById={data.portalKarkunById}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Wazaif &amp; Raabta" key="2">
        <WazaifAndRaabta
          portalId={portalId}
          karkunId={karkunId}
          portalKarkunById={data.portalKarkunById}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Profile Picture" key="3">
        <ProfilePicture
          portalId={portalId}
          karkunId={karkunId}
          portalKarkunById={data.portalKarkunById}
          {...props}
        />
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

export default EditForm;
