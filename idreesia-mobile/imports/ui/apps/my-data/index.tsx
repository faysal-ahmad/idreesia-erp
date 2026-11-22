import React from 'react';
import { UserOutline, ClockCircleOutline } from 'antd-mobile-icons';
import { ModuleNames, ModulePaths } from 'meteor/idreesia-common/constants';

import type { ModuleDefinition } from '../types';
import { DutiesAttendanceFeature } from './duties-attendance-feature';
import { MyDataPaths } from './paths';

export const MyDataModule: ModuleDefinition = {
  name: ModuleNames.myData,
  description: 'Your personal data',
  icon: <UserOutline />,
  path: ModulePaths.myData,
  features: [
    {
      key: 'duties-attendance',
      title: 'Duties & Attendance',
      icon: <ClockCircleOutline />,
      iconClassName: 'workspace-feature-icon workspace-feature-icon-da',
      path: MyDataPaths.dutiesAttendance,
      // The user's own data: open to every signed-in user.
      permissions: [],
      component: DutiesAttendanceFeature,
    },
  ],
};
