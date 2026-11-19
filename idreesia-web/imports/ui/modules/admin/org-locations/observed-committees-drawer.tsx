import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { TeamOutlined } from '@ant-design/icons';
import { Drawer, Spin, Tag, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';

import type { OrgLocationType } from 'meteor/idreesia-common/constants/organization';

import { ALL_ORG_LOCATIONS } from './gql';
import { toLocationRecords } from './helpers';
import {
  ORG_LOCATION_TYPE_COLORS,
  ORG_LOCATION_TYPE_LABELS,
  type LocationRecord,
} from './org-location-types';

interface Props {
  open: boolean;
  /** The location whose observers are shown; the root of the tree. */
  locationId: string;
  /** Who is being looked at. */
  observerName?: string | null;
  /** The committees the person observes. */
  observedCommitteeIds: string[];
  onClose(): void;
}

const locationTitle = (
  location: LocationRecord,
  total: number,
  selected: number
) => (
  <span>
    {location.name}{' '}
    <span title="Committees / selected, including child locations">
      ({total} / {selected})
    </span>{' '}
    <Tag color={ORG_LOCATION_TYPE_COLORS[location.type]} style={{ marginInlineEnd: 0 }}>
      {ORG_LOCATION_TYPE_LABELS[location.type as OrgLocationType]}
    </Tag>
  </span>
);

const committeeKey = (committeeId: string) => `committee-${committeeId}`;

/**
 * The location, the locations below it, and their committees as leaves. A
 * location with no committees under it has its checkbox disabled, which keeps
 * it out of the parents' checked state.
 */
const buildNodes = (
  rootId: string,
  locations: LocationRecord[],
  observed: Set<string>
): DataNode[] => {
  const childrenOf = new Map<string, LocationRecord[]>();
  locations.forEach(location => {
    if (location.parentId) {
      childrenOf.set(location.parentId, [
        ...(childrenOf.get(location.parentId) ?? []),
        location,
      ]);
    }
  });

  // Counts cover the location's own committees and everything below it.
  const toNode = (
    location: LocationRecord
  ): { node: DataNode; total: number; selected: number } => {
    const childResults = (childrenOf.get(location._id) ?? []).map(toNode);
    // Observers apply to the locations below the root, not to its own committees.
    const committees = location._id === rootId ? [] : location.committees;
    const children: DataNode[] = [
      ...childResults.map(result => result.node),
      ...committees.map(committee => ({
        key: committeeKey(committee._id),
        isLeaf: true,
        icon: <TeamOutlined />,
        title: committee.name,
      })),
    ];
    const total =
      committees.length + childResults.reduce((sum, r) => sum + r.total, 0);
    const selected =
      committees.filter(committee => observed.has(committee._id)).length +
      childResults.reduce((sum, r) => sum + r.selected, 0);
    return {
      node: {
        key: location._id,
        title: locationTitle(location, total, selected),
        children,
        disableCheckbox: !children.some(
          child => child.isLeaf || !child.disableCheckbox
        ),
      },
      total,
      selected,
    };
  };

  const root = locations.find(location => location._id === rootId);
  return root ? [toNode(root).node] : [];
};

const ObservedCommitteesDrawer = ({
  open,
  locationId,
  observerName,
  observedCommitteeIds,
  onClose,
}: Props) => {
  const { data, loading } = useQuery(ALL_ORG_LOCATIONS, { skip: !open });

  const treeData = useMemo(() => {
    const subtree = toLocationRecords(data?.allOrgLocations).filter(
      location =>
        location._id === locationId || location.allParentIds.includes(locationId)
    );
    return buildNodes(locationId, subtree, new Set(observedCommitteeIds));
  }, [data, locationId, observedCommitteeIds]);
  const checkedKeys = useMemo(
    () => observedCommitteeIds.map(committeeKey),
    [observedCommitteeIds]
  );

  return (
    <Drawer
      title={`Observed Committees${observerName ? ` - ${observerName}` : ''}`}
      width={600}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      {loading ? (
        <Spin />
      ) : (
        <Tree
          className="observed-committees-tree"
          showLine
          showIcon
          checkable
          selectable={false}
          // Display only: the checks show what the sync has set up.
          checkedKeys={checkedKeys}
          onCheck={() => undefined}
          treeData={treeData}
        />
      )}
    </Drawer>
  );
};

export default ObservedCommitteesDrawer;
