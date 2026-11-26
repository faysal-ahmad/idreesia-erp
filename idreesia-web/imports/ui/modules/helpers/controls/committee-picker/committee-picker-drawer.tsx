import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Button, Drawer, Table, Tag } from 'antd';

import { LocationTreeSelect, useReferenceLocations } from '../location-picker';
import { REFERENCE_COMMITTEES_BY_LOCATION } from './gql';

export interface PickerCommittee {
  _id: string;
  name: string;
  color?: string | null;
  memberCount: number;
}

interface Props {
  title: string;
  open: boolean;
  onClose(): void;
  onPick(committee: PickerCommittee): void;
  /** The committees already added, shown as "Added" instead of an Add button. */
  selectedIds?: string[];
  /** The committee being added, while its mutation runs. */
  addingId?: string | null;
}

/**
 * Picks a committee: choose a location in the tree, then add one of its
 * committees. The drawer stays open so several can be added.
 */
const CommitteePickerDrawer = ({
  title,
  open,
  onClose,
  onPick,
  selectedIds = [],
  addingId,
}: Props) => {
  const [locationId, setLocationId] = useState<string | null>(null);
  const { locations, loading: locationsLoading } = useReferenceLocations();
  const { data, loading } = useQuery(REFERENCE_COMMITTEES_BY_LOCATION, {
    variables: { locationId: locationId ?? '' },
    skip: !open || !locationId,
    fetchPolicy: 'cache-and-network',
  });

  const committees = (data?.referenceCommitteesByLocation ?? []).flatMap(
    committee => (committee?._id ? [committee as PickerCommittee] : [])
  );

  return (
    <Drawer
      title={title}
      width={720}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      <LocationTreeSelect
        locations={locations}
        loading={locationsLoading}
        value={locationId}
        onChange={id => setLocationId(id)}
        placeholder="Select a location to list its committees"
        style={{ width: '100%', marginBottom: 16 }}
      />
      <Table
        className="list-table"
        rowKey="_id"
        size="small"
        bordered
        loading={loading && !data}
        pagination={false}
        locale={{
          emptyText: locationId
            ? 'This location has no committees.'
            : 'Select a location first.',
        }}
        dataSource={locationId ? committees : []}
        columns={[
          {
            title: 'Committee',
            dataIndex: 'name',
            render: (name: string, committee: PickerCommittee) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                {name}
                {committee.color ? (
                  <Tag color={committee.color}>&nbsp;</Tag>
                ) : null}
              </div>
            ),
          },
          {
            title: 'Members',
            dataIndex: 'memberCount',
            width: 90,
            align: 'right' as const,
          },
          {
            key: 'action',
            width: 110,
            render: (_: unknown, committee: PickerCommittee) =>
              selectedIds.includes(committee._id) ? (
                <Tag>Added</Tag>
              ) : (
                <Button
                  size="small"
                  type="primary"
                  loading={addingId === committee._id}
                  onClick={() => onPick(committee)}
                >
                  Add
                </Button>
              ),
          },
        ]}
      />
    </Drawer>
  );
};

export default CommitteePickerDrawer;
