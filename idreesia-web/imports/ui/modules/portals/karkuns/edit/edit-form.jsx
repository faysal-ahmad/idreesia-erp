import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, Dropdown, Modal, Result, Tabs, message } from 'antd';
import { useQuery, useMutation } from '@apollo/react-hooks';
import {
  AuditOutlined,
  MinusCircleOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { usePortal } from 'meteor/idreesia-common/hooks/portals';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import GeneralInfo from './general-info';
import WazaifAndRaabta from './wazaif-and-raabta';
import ProfilePicture from './profile-picture';
import DutyParticipation from './duty-participation';
import AttendanceSheets from './attendance-sheets';

import {
  PORTAL_KARKUN_BY_ID,
  REMOVE_PORTAL_KARKUN,
} from '../gql';

const EditForm = props => {
  const { location, history } = props;
  const { portalId, karkunId } = useParams();
  const { portal } = usePortal();
  const dispatch = useDispatch();
  const [removePortalKarkun] = useMutation(REMOVE_PORTAL_KARKUN);

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portals', portal.name, 'Karkuns', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portals', 'Karkuns', 'Edit']));
    }
  }, [location, portalId]);

  const { data, loading, refetch } = useQuery(PORTAL_KARKUN_BY_ID, {
    variables: {
      portalId,
      _id: karkunId,
    },
  });
  
  const actionItems = [
    {
      key: 'reload-data',
      label: 'Reload Data',
      icon: <SyncOutlined />
    },
    {
      key: 'remove-from-karkuns',
      label: 'Remove from Karkuns',
      icon: <MinusCircleOutlined />,
    },
    {
      key: 'view-audit-logs',
      label: 'View Audit Logs',
      icon: <AuditOutlined />,
    },
  ];

  const handleAction = ({ key }) => {
    if (key === 'reload-data') {
      refetch()
        .then(() => {
          message.success('Data Reloaded', 2);
        });
    } else if (key === 'remove-from-karkuns') {
      Modal.confirm({
        title: 'Do you want to remove this person from karkuns?',
        onOk() {
          removePortalKarkun({
            variables: {
              portalId,
              _id: karkunId,
            },
          })
            .then(() => {
              message.success('Person has been removed from karkuns.', 5);
              history.goBack();
            })
            .catch(error => {
              message.error(error.message, 5);
            });
          },
        onCancel() {},
      });
    } else if (key === 'view-audit-logs') {
      history.push(`${paths.auditLogsPath(portalId)}?entityId=${karkunId}`);
    }
  }

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
    <Tabs defaultActiveKey="1" tabBarExtraContent={
      <Dropdown menu={{ items: actionItems, onClick: handleAction }}>
        <Button type='text' icon={<SettingOutlined />} size="large" />
      </Dropdown>
    }>
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
