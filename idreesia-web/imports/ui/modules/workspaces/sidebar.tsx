import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { type History } from 'history';
import { Menu, Tooltip, TreeSelect } from 'antd';
import {
  AlertOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  ClusterOutlined,
  ContainerOutlined,
  FolderOpenOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  MessageOutlined,
  MoonOutlined,
  ProjectOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  TableOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import { useMyDutiesAttendanceLocations } from './duties-attendance';
import { useMyMehfilDetailsLocations } from './mehfil-details';
import { useMyMehfilPermissionsLocations } from './mehfil-permissions';
import { useMyCommitteeLocations } from './hooks/use-my-committee-locations';
import { useMyCommittees } from './hooks/use-my-committees';
import SubModuleNames from './submodule-names';
import { default as paths, NO_LOCATION_SEGMENT } from './submodule-paths';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

interface SidebarProps {
  history: History;
}

type PathBuilder = (locationId?: string, committeeId?: string) => string;
type KeyPrefixHandler = [string, string, PathBuilder];

// [menu key prefix, sub-module name, path builder] for each committee
// sub-module. Menu keys are `${prefix}-${committeeId}`.
const KeyPrefixHandlers: KeyPrefixHandler[] = [
  ['members', SubModuleNames.members, paths.committeeMembersPath],
  ['discussions', SubModuleNames.discussions, paths.committeeDiscussionsPath],
  ['documents', SubModuleNames.documents, paths.committeeDocumentsPath],
  ['meetings', SubModuleNames.meetings, paths.committeeMeetingsPath],
  ['polls', SubModuleNames.polls, paths.committeePollsPath],
  ['projects', SubModuleNames.projects, paths.committeeProjectsPath],
  [
    'night-stay-report',
    SubModuleNames.nightStayReport,
    paths.committeeNightStayReportPath,
  ],
  [
    'monitoring-alerts',
    SubModuleNames.monitoringAlerts,
    paths.committeeMonitoringAlertsPath,
  ],
  [
    'monitoring-profiles',
    SubModuleNames.monitoringProfiles,
    paths.committeeMonitoringProfilesPath,
  ],
];

// [menu key prefix, path segment, sub-module name, path builder] for each
// page of a mehfil's Duties and Attendance workspace. Menu keys are
// `${prefix}-${locationId}`.
type DutiesAttendanceHandler = [string, string, string, PathBuilder];
const DutiesAttendanceHandlers: DutiesAttendanceHandler[] = [
  ['da-duties', 'duties', SubModuleNames.duties, paths.locationDutiesPath],
  [
    'da-planning',
    'planning',
    SubModuleNames.dutyPlanning,
    paths.locationDutyPlanningPath,
  ],
  [
    'da-attendance',
    'attendance',
    SubModuleNames.dutyAttendance,
    paths.locationDutyAttendancePath,
  ],
  [
    'da-sheet',
    'attendance-sheet',
    SubModuleNames.attendanceSheet,
    paths.locationAttendanceSheetPath,
  ],
];

const MEHFIL_DETAILS_KEY_PREFIX = 'mehfil-details-';
const MEHFIL_PERMISSIONS_KEY_PREFIX = 'mehfil-permissions-';

const mehfilDetailsMenuKey = (locationId: string) =>
  `${MEHFIL_DETAILS_KEY_PREFIX}${locationId}`;
const mehfilPermissionsMenuKey = (locationId: string) =>
  `${MEHFIL_PERMISSIONS_KEY_PREFIX}${locationId}`;

// A workspace's submenu key, e.g. the committee's id or `da-${locationId}`.
const dutiesAttendanceSubMenuKey = (locationId: string) => `da-${locationId}`;

interface ActiveMenu {
  // The submenu to keep open.
  subMenuKey: string;
  // Set for a committee page / a location workspace page.
  committeeId?: string;
  locationId?: string;
  key: string;
  subModuleName: string;
}

// Label that shows the full name in a tooltip, only when the text is cut off.
// Fills the row so hovering anywhere on it triggers the tooltip.
const NameLabel = ({ name }: { name?: string | null }) => {
  const [truncated, setTruncated] = useState(false);

  return (
    <Tooltip
      title={truncated ? name : undefined}
      placement="right"
      mouseEnterDelay={0.3}
    >
      <span
        style={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) =>
          setTruncated(e.currentTarget.scrollWidth > e.currentTarget.clientWidth)
        }
      >
        {name}
      </span>
    </Tooltip>
  );
};

const SELECTED_LOCATION_STORAGE_KEY = 'workspaces-sidebar-location';
const NO_LOCATION = '';

const readStoredLocationId = (): string | null => {
  try {
    return window.localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY);
  } catch {
    return null;
  }
};

const storeLocationId = (locationId: string) => {
  try {
    window.localStorage.setItem(SELECTED_LOCATION_STORAGE_KEY, locationId);
  } catch {
    // Persisting the selection is only a convenience.
  }
};

const COMMITTEE_PATH_REGEX = new RegExp(
  `^${paths.committeePath('([^/]+)', '([^/]+)')}/([^/]+)`
);

const LOCATION_PATH_REGEX = new RegExp(
  `^${paths.locationDutiesAttendancePath('([^/]+)')}/([^/]+)`
);

const MEHFIL_DETAILS_PATH_REGEX = new RegExp(
  `^${paths.locationMehfilDetailsPath('([^/]+)')}`
);

const MEHFIL_PERMISSIONS_PATH_REGEX = new RegExp(
  `^${paths.locationMehfilPermissionsPath('([^/]+)')}`
);

const resolveMenuFromPath = (pathname: string): ActiveMenu | null => {
  const permissionsMatch = MEHFIL_PERMISSIONS_PATH_REGEX.exec(pathname);
  if (permissionsMatch) {
    const [, locationId] = permissionsMatch;
    return {
      subMenuKey: mehfilPermissionsMenuKey(locationId),
      locationId,
      key: mehfilPermissionsMenuKey(locationId),
      subModuleName: SubModuleNames.mehfilPermissions,
    };
  }

  const detailsMatch = MEHFIL_DETAILS_PATH_REGEX.exec(pathname);
  if (detailsMatch) {
    const [, locationId] = detailsMatch;
    return {
      subMenuKey: mehfilDetailsMenuKey(locationId),
      locationId,
      key: mehfilDetailsMenuKey(locationId),
      subModuleName: SubModuleNames.mehfilDetails,
    };
  }

  const locationMatch = LOCATION_PATH_REGEX.exec(pathname);
  if (locationMatch) {
    const [, locationId, segment] = locationMatch;
    const handler = DutiesAttendanceHandlers.find(([, s]) => s === segment);
    if (!handler) return null;
    return {
      subMenuKey: dutiesAttendanceSubMenuKey(locationId),
      locationId,
      key: `${handler[0]}-${locationId}`,
      subModuleName: handler[2],
    };
  }

  const match = COMMITTEE_PATH_REGEX.exec(pathname);
  if (!match) return null;
  const [, , committeeId, prefix] = match;
  const handler = KeyPrefixHandlers.find(([p]) => p === prefix);
  if (!handler) return null;
  return {
    subMenuKey: committeeId,
    committeeId,
    key: `${prefix}-${committeeId}`,
    subModuleName: handler[1],
  };
};

const sameKeySet = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((key) => setB.has(key));
};

// Location dropdown plus the committees of the selected location, each with
// its sub-modules.
const Sidebar = ({ history }: SidebarProps) => {
  const { activeSubModuleName, setActiveSubModuleName } = useActiveModule();
  const { committees, loading: committeesLoading } = useMyCommittees();
  const { locations: committeeLocations, loading: locationsLoading } =
    useMyCommitteeLocations();
  const { locations: dutiesAttendanceLocations, loading: daLoading } =
    useMyDutiesAttendanceLocations();
  const { locations: mehfilDetailsLocations, loading: detailsLoading } =
    useMyMehfilDetailsLocations();
  const { locations: mehfilPermissionsLocations, loading: permissionsLoading } =
    useMyMehfilPermissionsLocations();
  const loading =
    committeesLoading ||
    locationsLoading ||
    daLoading ||
    detailsLoading ||
    permissionsLoading;
  const [pathname, setPathname] = useState(history.location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      setPathname(location.pathname);
    });
    return unlisten;
  }, [history]);

  const activeMenu = useMemo(() => resolveMenuFromPath(pathname), [pathname]);

  // Committees grouped by location.
  const committeesByLocation = useMemo(() => {
    const map = new Map<string, typeof committees>();
    committees.forEach((committee) => {
      const key = committee.locationId ?? NO_LOCATION;
      const list = map.get(key) ?? [];
      list.push(committee);
      map.set(key, list);
    });
    return map;
  }, [committees]);

  // Mehfils whose Duties and Attendance workspace the user can open.
  const workspaceLocationsById = useMemo(
    () =>
      new Map(
        dutiesAttendanceLocations
          .filter((location) => location.hasWorkspace)
          .map((location) => [location.locationId, location])
      ),
    [dutiesAttendanceLocations]
  );

  // Mehfils whose details the user can open.
  const mehfilDetailsLocationIds = useMemo(
    () =>
      new Set(
        mehfilDetailsLocations
          .filter((location) => location.hasWorkspace)
          .map((location) => location.locationId)
      ),
    [mehfilDetailsLocations]
  );

  // Mehfils whose permissions the user can open.
  const mehfilPermissionsLocationIds = useMemo(
    () =>
      new Set(
        mehfilPermissionsLocations
          .filter((location) => location.hasWorkspace)
          .map((location) => location.locationId)
      ),
    [mehfilPermissionsLocations]
  );

  // The locations of the user's committees and workspaces, plus all their
  // ancestors.
  const locations = useMemo(() => {
    const byId = new Map<
      string,
      { _id?: string | null; name?: string | null; parentId?: string | null }
    >();
    committeeLocations.forEach((location) => byId.set(location._id!, location));
    [
      ...dutiesAttendanceLocations,
      ...mehfilDetailsLocations,
      ...mehfilPermissionsLocations,
    ].forEach((location) => {
      if (!byId.has(location.locationId)) {
        byId.set(location.locationId, {
          _id: location.locationId,
          name: location.name,
          parentId: location.parentId,
        });
      }
    });
    return Array.from(byId.values());
  }, [
    committeeLocations,
    dutiesAttendanceLocations,
    mehfilDetailsLocations,
    mehfilPermissionsLocations,
  ]);

  // Location tree for the dropdown. The query returns the user's locations
  // plus their ancestors; ancestors without committees or workspaces stay in
  // the tree for context but can't be selected.
  const locationTree = useMemo(() => {
    type TreeNode = {
      value: string;
      title: string;
      selectable: boolean;
      children: TreeNode[];
    };
    const ids = new Set(locations.map((location) => location._id!));
    const nodes = new Map<string, TreeNode>(
      locations.map((location) => [
        location._id!,
        {
          value: location._id!,
          title: location.name ?? '',
          selectable:
            committeesByLocation.has(location._id!) ||
            workspaceLocationsById.has(location._id!) ||
            mehfilDetailsLocationIds.has(location._id!) ||
            mehfilPermissionsLocationIds.has(location._id!),
          children: [],
        },
      ])
    );
    const roots: TreeNode[] = [];
    locations.forEach((location) => {
      const node = nodes.get(location._id!)!;
      if (location.parentId && ids.has(location.parentId)) {
        nodes.get(location.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sortTree = (list: TreeNode[]) => {
      list.sort((a, b) => a.title.localeCompare(b.title));
      list.forEach((node) => sortTree(node.children));
    };
    sortTree(roots);
    if (committeesByLocation.has(NO_LOCATION)) {
      roots.push({
        value: NO_LOCATION,
        title: 'No Location',
        selectable: true,
        children: [],
      });
    }
    return roots;
  }, [
    locations,
    committeesByLocation,
    workspaceLocationsById,
    mehfilDetailsLocationIds,
    mehfilPermissionsLocationIds,
  ]);

  // Selectable locations in tree order, used for the default selection.
  const selectableLocationIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (list: typeof locationTree) =>
      list.forEach((node) => {
        if (node.selectable) ids.push(node.value);
        walk(node.children);
      });
    walk(locationTree);
    return ids;
  }, [locationTree]);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    readStoredLocationId
  );

  const effectiveLocationId =
    selectedLocationId !== null &&
    selectableLocationIds.includes(selectedLocationId)
      ? selectedLocationId
      : (selectableLocationIds[0] ?? NO_LOCATION);

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    storeLocationId(locationId);
  };

  useEffect(() => {
    if (!activeMenu) return;

    if (activeSubModuleName !== activeMenu.subModuleName) {
      setActiveSubModuleName(activeMenu.subModuleName);
    }

    // Follow the route: switch to the active committee's or workspace's
    // location.
    const activeCommittee = committees.find(
      (committee) => committee._id === activeMenu.committeeId
    );
    let routeLocationId = activeMenu.locationId;
    if (routeLocationId === undefined && activeCommittee) {
      routeLocationId = activeCommittee.locationId ?? NO_LOCATION;
    }
    if (routeLocationId !== undefined) {
      setSelectedLocationId((prev) =>
        prev === routeLocationId ? prev : routeLocationId
      );
    }

    setOpenKeys((prev) => {
      const merged = Array.from(new Set([...prev, activeMenu.subMenuKey]));
      return sameKeySet(prev, merged) ? prev : merged;
    });
  }, [activeMenu, activeSubModuleName, setActiveSubModuleName, committees]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys((prev) => (sameKeySet(prev, keys) ? prev : keys));
  };

  const handleMenuItemSelected = ({ key }: { key: string }) => {
    if (key.startsWith(MEHFIL_DETAILS_KEY_PREFIX)) {
      setActiveSubModuleName(SubModuleNames.mehfilDetails);
      history.push(
        paths.locationMehfilDetailsPath(
          key.slice(MEHFIL_DETAILS_KEY_PREFIX.length)
        )
      );
      return;
    }
    if (key.startsWith(MEHFIL_PERMISSIONS_KEY_PREFIX)) {
      setActiveSubModuleName(SubModuleNames.mehfilPermissions);
      history.push(
        paths.locationMehfilPermissionsPath(
          key.slice(MEHFIL_PERMISSIONS_KEY_PREFIX.length)
        )
      );
      return;
    }

    const workspaceHandler = DutiesAttendanceHandlers.find(([prefix]) =>
      key.startsWith(`${prefix}-`)
    );
    if (workspaceHandler) {
      const [prefix, , subModuleName, getPath] = workspaceHandler;
      setActiveSubModuleName(subModuleName);
      history.push(getPath(key.slice(prefix.length + 1) as string));
      return;
    }

    const handler = KeyPrefixHandlers.find(([prefix]) =>
      key.startsWith(`${prefix}-`)
    );
    if (!handler) return;

    const [prefix, subModuleName, getPath] = handler;
    const committeeId = key.slice(prefix.length + 1);
    setActiveSubModuleName(subModuleName);
    const committee = committees.find((row) => row._id === committeeId);
    history.push(
      getPath(committee?.locationId ?? NO_LOCATION_SEGMENT, committeeId)
    );
  };

  if (loading) return null;

  const buildCommitteeItem = (committee: (typeof committees)[number]) => ({
    key: committee._id!,
    icon: <ClusterOutlined style={IconStyle} />,
    label: <NameLabel name={committee.name} />,
    children: [
      // Each item only for committees with that feature enabled.
      ...(committee.features?.includes(CommitteeFeatureKeys.MEMBERS)
        ? [
            {
              key: `members-${committee._id}`,
              icon: <TeamOutlined style={IconStyle} />,
              label: <NameLabel name='Members' />,
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.DISCUSSIONS)
        ? [
            {
              key: `discussions-${committee._id}`,
              icon: <MessageOutlined style={IconStyle} />,
              label: <NameLabel name='Discussions' />,
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.DOCUMENTS)
        ? [
            {
              key: `documents-${committee._id}`,
              icon: <FolderOpenOutlined style={IconStyle} />,
              label: <NameLabel name='Documents' />,
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.MEETINGS)
        ? [
            {
              key: `meetings-${committee._id}`,
              icon: <CalendarOutlined style={IconStyle} />,
              label: <NameLabel name='Meetings' />,
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.POLLS)
        ? [
            {
              key: `polls-${committee._id}`,
              icon: <BarChartOutlined style={IconStyle} />,
              label: <NameLabel name='Polls' />,
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.PROJECTS)
        ? [
            {
              key: `projects-${committee._id}`,
              icon: <ProjectOutlined style={IconStyle} />,
              label: <NameLabel name='Projects & Tasks' />,
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.NIGHT_STAY_REPORT)
        ? [
            {
              key: `night-stay-report-${committee._id}`,
              icon: <MoonOutlined style={IconStyle} />,
              label: <NameLabel name='Night Stay Report' />,
            },
          ]
        : []),
      ...(committee.features?.includes(
        CommitteeFeatureKeys.MONITORING_ALERTS
      )
        ? [
            {
              key: `monitoring-alerts-${committee._id}`,
              icon: <AlertOutlined style={IconStyle} />,
              label: <NameLabel name='Monitoring Alerts' />,
            },
          ]
        : []),
      ...(committee.features?.includes(
        CommitteeFeatureKeys.MONITORING_PROFILES
      )
        ? [
            {
              key: `monitoring-profiles-${committee._id}`,
              icon: <IdcardOutlined style={IconStyle} />,
              label: <NameLabel name='Monitoring Profiles' />,
            },
          ]
        : []),
    ],
  });

  // A mehfil's Duties and Attendance feature, with its pages. The location
  // itself is already shown in the selector above.
  const buildDutiesAttendanceItem = (locationId: string) => ({
    key: dutiesAttendanceSubMenuKey(locationId),
    icon: <ContainerOutlined style={IconStyle} />,
    label: <NameLabel name='Duties & Attendance' />,
    children: [
      {
        key: `da-duties-${locationId}`,
        icon: <SolutionOutlined style={IconStyle} />,
        label: <NameLabel name='Duties' />,
      },
      {
        key: `da-planning-${locationId}`,
        icon: <ScheduleOutlined style={IconStyle} />,
        label: <NameLabel name='Duty Planning' />,
      },
      {
        key: `da-attendance-${locationId}`,
        icon: <CheckSquareOutlined style={IconStyle} />,
        label: <NameLabel name='Duty Attendance' />,
      },
      {
        key: `da-sheet-${locationId}`,
        icon: <TableOutlined style={IconStyle} />,
        label: <NameLabel name='Attendance Sheet' />,
      },
    ],
  });

  const workspaceLocation = workspaceLocationsById.get(effectiveLocationId);
  const menuItems = [
    ...(mehfilDetailsLocationIds.has(effectiveLocationId)
      ? [
          {
            key: mehfilDetailsMenuKey(effectiveLocationId),
            icon: <EnvironmentOutlined style={IconStyle} />,
            label: <NameLabel name='Mehfil Details' />,
          },
        ]
      : []),
    ...(mehfilPermissionsLocationIds.has(effectiveLocationId)
      ? [
          {
            key: mehfilPermissionsMenuKey(effectiveLocationId),
            icon: <SafetyCertificateOutlined style={IconStyle} />,
            label: <NameLabel name='Mehfil Permissions' />,
          },
        ]
      : []),
    ...(committeesByLocation.get(effectiveLocationId) ?? []).map(
      buildCommitteeItem
    ),
    ...(workspaceLocation
      ? [buildDutiesAttendanceItem(workspaceLocation.locationId)]
      : []),
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '2px solid var(--ant-color-border, #d9d9d9)',
        }}
      >
        <TreeSelect
          style={{ width: '100%' }}
          placeholder="Select location"
          value={selectableLocationIds.length ? effectiveLocationId : undefined}
          treeData={locationTree}
          onChange={handleLocationChange}
          treeDefaultExpandAll
          // The dropdown is wider than the sidebar, so deep locations fit.
          popupMatchSelectWidth={false}
          styles={{ popup: { root: { minWidth: 360, maxWidth: '90vw' } } }}
          showSearch
          treeNodeFilterProp="title"
        />
      </div>
      <Menu
        mode="inline"
        style={{ flex: 1, borderRight: 0, overflowY: 'auto' }}
        selectedKeys={activeMenu ? [activeMenu.key] : []}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuItemSelected}
        items={menuItems}
      />
    </div>
  );
};

export default Sidebar;
