import React from 'react';
import { CheckShieldOutline, TeamOutline } from 'antd-mobile-icons';
import { ModuleNames, ModulePaths, Permissions } from 'meteor/idreesia-common/constants';

import type { ModuleDefinition } from '../types';
import { SecurityPaths } from './paths';
import { VisitorsFeature } from './visitors';

export const SecurityModule: ModuleDefinition = {
  name: ModuleNames.security,
  description: 'Visitors and mehfil security',
  icon: <CheckShieldOutline />,
  path: ModulePaths.security,
  features: [
    {
      key: 'visitors',
      title: 'Visitors',
      description: 'Search visitors by name, CNIC or phone',
      icon: <TeamOutline />,
      path: SecurityPaths.visitors,
      permissions: [Permissions.SECURITY_VIEW_VISITORS, Permissions.SECURITY_MANAGE_VISITORS],
      component: VisitorsFeature,
    },
  ],
};
