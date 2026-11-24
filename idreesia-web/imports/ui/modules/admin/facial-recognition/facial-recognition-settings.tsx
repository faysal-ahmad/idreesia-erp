import React from 'react';
import { Tabs } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import SelfAttendanceTab from './self-attendance-tab';
import PeopleRegistrationTab from './people-registration-tab';
import PeopleSearchTab from './people-search-tab';

const FacialRecognitionSettings = () => {
  useBreadcrumbs(['Admin', 'Configuration', 'Facial Recognition']);

  return (
    <Tabs
      defaultActiveKey="people-registration"
      items={[
        {
          key: 'people-registration',
          label: 'People Registration',
          children: <PeopleRegistrationTab />,
        },
        {
          key: 'people-search',
          label: 'People Search',
          children: <PeopleSearchTab />,
        },
        {
          key: 'self-attendance',
          label: 'Self-Attendance',
          children: <SelfAttendanceTab />,
        },
      ]}
    />
  );
};

export default FacialRecognitionSettings;
