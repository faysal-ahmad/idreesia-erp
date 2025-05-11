import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import { Tabs } from 'antd';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';

import GeneralInfo from './general-info';
import WazaifAndRaabta from './wazaif-and-raabta';
import ProfilePicture from './profile-picture';
import DutyParticipation from './duty-participation';
import AttendanceSheets from './attendance-sheets';
import UserAccount from './user-account';

import { OUTSTATION_KARKUN_BY_ID } from '../gql';

const EditForm = props => {
  const dispatch = useDispatch();
  const { karkunId } = useParams();
  const { data, loading, refetch } = useQuery(OUTSTATION_KARKUN_BY_ID, {
    skip: !karkunId,
    variables: {
      _id: karkunId,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Karkuns', 'Edit']));
  }, []);
  
  if (loading || !data) return null;
  const { outstationKarkunById } = data;

  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo 
          karkunId={karkunId}
          outstationKarkunById={outstationKarkunById}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Profile Picture" key="2">
        <ProfilePicture
          karkunId={karkunId}
          outstationKarkunById={outstationKarkunById}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Wazaif &amp; Raabta" key="3">
        <WazaifAndRaabta
          karkunId={karkunId}
          outstationKarkunById={outstationKarkunById}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Duty Participation" key="4">
        <DutyParticipation karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Attendance Sheets" key="5">
        <AttendanceSheets karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="User Account" key="6">
        <UserAccount
          karkunId={karkunId}
          outstationKarkunById={outstationKarkunById}
          refetchKarkun={refetch}
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
  queryParams: PropTypes.object,
};

export default EditForm;
