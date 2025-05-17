import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button, Dropdown, Modal, Result, Tabs, message } from 'antd';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { 
  AuditOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { usePortal } from 'meteor/idreesia-common/hooks/portals';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import GeneralInfo from './general-info';
import Picture from './picture';

import {
  ADD_PORTAL_KARKUN,
  PORTAL_MEMBER_BY_ID,
} from '../gql';

const EditForm = props => {
  const { location, history } = props;
  const { portalId, memberId } = useParams();
  const { portal } = usePortal();
  const dispatch = useDispatch();
  const [addPortalKarkun] = useMutation(ADD_PORTAL_KARKUN);

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portals', portal.name, 'Members', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portals', 'Members', 'Edit']));
    }
  }, [location, portalId]);

  const { data, loading, refetch } = useQuery(PORTAL_MEMBER_BY_ID, {
    variables: {
      portalId,
      _id: memberId,
    },
  });
  
  const actionItems = [
    {
      key: 'reload-data',
      label: 'Reload Data',
      icon: <SyncOutlined />
    },
    {
      key: 'add-to-karkuns',
      label: 'Add to Karkuns',
      icon: <PlusCircleOutlined />,
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
    } else if (key === 'add-to-karkuns') {
      Modal.confirm({
        title: 'Do you want to add this person to karkuns?',
        onOk() {
          addPortalKarkun({
            variables: {
              portalId,
              _id: memberId,
            },
          })
            .then(() => {
              message.success('Person was successfully added to karkuns.', 5);
              history.goBack();
            })
            .catch(error => {
              message.error(error.message, 5);
            });
          },
        onCancel() {},
      });
    } else if (key === 'view-audit-logs') {
      history.push(`${paths.auditLogsPath(portalId)}?entityId=${memberId}`);
    }
  }

  if (loading) return null;
  if (!data?.portalMemberById) return (
    <Result
        status="warning"
        title="Member was not found in the portal."
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
          memberId={memberId}
          portalMemberById={data.portalMemberById}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Picture" key="2">
        <Picture
          portalId={portalId}
          memberId={memberId}
          portalMemberById={data.portalMemberById}
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
