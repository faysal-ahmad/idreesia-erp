import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Flex, Tabs } from 'antd';
import {
  DeleteOutlined,
  ExportOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants';

import { GeneralInfo } from './general-info';
import { LocationUsers } from './location-users';

export const EditForm = ({ orgLocation, onCreateLocation }) => {
  const tabItems = [
    {
      key: "1",
      label: "General Info",
      children: (
        <Flex justify="center">
          <GeneralInfo
            orgLocation={orgLocation}
            handleSave={() => {}}
          />
        </Flex>
      ),
    },
    {
      key: "2",
      label: "Location Users",
      children: (
        <Flex justify="center">
          <LocationUsers
            orgLocation={orgLocation}
          />
        </Flex>
      ),
    },
  ];

  const menuItems = [
    {
      key: 'create',
      label: 'Create Child Location',
      children: [
        {
          key: 'create-mehfil',
          label: 'Mehfil',
        },
        {
          key: 'create-city',
          label: 'City',
        },
        {
          key: 'create-country',
          label: 'Country',
        },
        {
          type: 'divider',
        },
        {
          key: 'create-group',
          label: 'Group',
        },
      ],
    },
    {
      type: 'divider',
    },
{
      key: 'move',
      label: 'Move Location',
      icon: <ExportOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete Location',
      icon: <DeleteOutlined />,
    },
  ];

  const handleMenuAction = ({ key }) => {
    if (key === 'create-mehfil') {
      onCreateLocation(OrgLocationTypes.MEHFIL);
    } else if (key === 'create-city') {
      onCreateLocation(OrgLocationTypes.CITY);
    } else if (key === 'create-country') {
      onCreateLocation(OrgLocationTypes.COUNTRY);
    } else if (key === 'create-group') {
      onCreateLocation(OrgLocationTypes.GROUP);
    }
  }

  const operations = (
    <Dropdown menu={{ items: menuItems, onClick: handleMenuAction }}>
      <Button icon={<SettingOutlined />} size="large" />
    </Dropdown>
  );

  return (
    <div style={{ paddingLeft: 10 }}>
      <Tabs defaultActiveKey="1" items={tabItems} tabBarExtraContent={operations} />
    </div>
  );
}

EditForm.propTypes = {
  orgLocation: PropTypes.object,
  onCreateLocation: PropTypes.func,
  onMoveLocation: PropTypes.func,
  onDeleteLocation: PropTypes.func,
};