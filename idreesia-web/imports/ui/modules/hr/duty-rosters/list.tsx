import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@apollo/client/react';
import { type History } from 'history';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Space, Spin, Table } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  useAllDutyLocations,
  useAllMSDuties,
} from '/imports/ui/modules/hr/common/hooks';
import type { ActiveDutyRostersQuery } from 'meteor/idreesia-common/types/client-operations';

import { default as paths } from '../submodule-paths';
import ListFilter, { DutyRostersFilterChips } from './list-filter';
import NewForm, { type RosterFormValues } from './new-form';
import { ACTIVE_DUTY_ROSTERS, CREATE_DUTY_ROSTER } from './gql';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type RosterRow = NonNullable<
  NonNullable<ActiveDutyRostersQuery['activeDutyRosters']>[number]
> & { _id: string };

interface LocationOption {
  _id: string;
  dutyId: string;
  name: string;
}

interface DutyOption {
  _id: string;
  name: string;
}

interface LocationTreeNode {
  key: string;
  kind: 'location';
  dutyId: string;
  locationId: string;
  name: string;
  roster: RosterRow | null;
}

interface DutyTreeNode {
  key: string;
  kind: 'duty';
  name: string;
  children: LocationTreeNode[];
}

type TreeNode = DutyTreeNode | LocationTreeNode;

interface ListProps {
  history: History;
  location: {
    pathname: string;
    search: string;
  };
}

const formatRosterDate = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM, YYYY') : '';

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';

const buildRosterTree = (
  duties: DutyOption[],
  locations: LocationOption[],
  rows: RosterRow[],
  dutyFilter: string,
  locationFilter: string
): DutyTreeNode[] => {
  const rosterByPair = new Map<string, RosterRow>();
  rows.forEach(row => {
    if (!row.dutyId || !row.locationId) return;
    rosterByPair.set(`${row.dutyId}:${row.locationId}`, row);
  });

  const visibleDuties = duties
    .filter(duty => !dutyFilter || duty._id === dutyFilter)
    .sort((left, right) => left.name.localeCompare(right.name));

  return visibleDuties
    .map(duty => {
      const children = locations
        .filter(
          location =>
            location.dutyId === duty._id &&
            (!locationFilter || location._id === locationFilter)
        )
        .sort((left, right) => left.name.localeCompare(right.name))
        .map(location => ({
          key: `location:${location._id}`,
          kind: 'location' as const,
          dutyId: duty._id,
          locationId: location._id,
          name: location.name,
          roster: rosterByPair.get(`${duty._id}:${location._id}`) ?? null,
        }));
      return {
        key: `duty:${duty._id}`,
        kind: 'duty' as const,
        name: duty.name,
        children,
      };
    })
    .filter(duty => duty.children.length > 0);
};

const List = ({ history, location }: ListProps) => {
  useBreadcrumbs(['HR', 'Duty Rosters']);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [collapsedDutyKeys, setCollapsedDutyKeys] = useState<string[]>([]);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [createFor, setCreateFor] = useState<{
    dutyId: string;
    locationId: string;
  } | null>(null);
  const [newForm] = Form.useForm<RosterFormValues>();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['dutyId', 'locationId'],
  });

  const dutyId = String(queryParams.dutyId || '');
  const locationId = String(queryParams.locationId || '');

  const { data, loading, refetch } = useQuery(ACTIVE_DUTY_ROSTERS, {
    variables: {
      dutyId: dutyId || null,
      locationId: locationId || null,
    },
    fetchPolicy: 'cache-and-network',
  });
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyLocations, allDutyLocationsLoading } = useAllDutyLocations();
  const [createDutyRoster, { loading: creating }] = useMutation(CREATE_DUTY_ROSTER, {
    refetchQueries: ['activeDutyRosters'],
  });

  const rows = (data?.activeDutyRosters ?? []).filter(
    (row): row is RosterRow => row != null && row._id != null
  );
  const duties = (allMSDuties ?? []).filter(
    (duty): duty is DutyOption => duty?._id != null && duty.name != null
  );
  const locations = (allDutyLocations ?? []).filter(
    (location): location is LocationOption =>
      location?._id != null && location.dutyId != null && location.name != null
  );
  const tree = useMemo(
    () => buildRosterTree(duties, locations, rows, dutyId, locationId),
    [duties, locations, rows, dutyId, locationId]
  );
  const expandedRowKeys = tree
    .map(node => node.key)
    .filter(key => !collapsedDutyKeys.includes(key));

  const updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const contentEl = container.closest('.ant-layout-content') as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit = contentEl.getBoundingClientRect().bottom - paddingBottom;
      }
      const nextScrollY = Math.max(
        200,
        Math.floor(bottomLimit - titleBottom - theadHeight - VIEWPORT_BOTTOM_GAP)
      );
      setScrollY(prev => (Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev));
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  const dutyName = (allMSDuties ?? []).find(duty => duty?._id === dutyId)?.name;
  const locationName = (allDutyLocations ?? []).find(
    item => item?._id === locationId
  )?.name;

  const handleCreate = () =>
    newForm
      .validateFields()
      .then(values =>
        createDutyRoster({
          variables: {
            dutyId: values.dutyId,
            locationId: values.locationId,
            startDate: values.startDate.format('YYYY-MM-DD'),
            endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
          },
        })
      )
      .then(result => {
        message.success('Roster created', 2);
        setShowNewFormModal(false);
        setCreateFor(null);
        newForm.resetFields();
        const rosterId = result.data?.createDutyRoster?._id;
        if (rosterId) history.push(paths.dutyRostersEditFormPath(rosterId));
      })
      .catch((error: unknown) => {
        const text = errorMessage(error);
        if (text) message.error(text, 5);
      });

  const columns: any[] = [
    {
      title: 'Duty / Location',
      key: 'name',
      render: (_text: unknown, record: TreeNode) => {
        if (record.kind === 'duty') {
          return <span className="duty-roster-list-duty">{record.name}</span>;
        }
        const roster = record.roster;
        if (!roster) return record.name;
        return (
          <Button
            type="link"
            style={{ padding: 0, height: 'auto' }}
            onClick={() => history.push(paths.dutyRostersEditFormPath(roster._id))}
          >
            {record.name}
          </Button>
        );
      },
    },
    {
      title: 'Start',
      key: 'startDate',
      width: 150,
      render: (_text: unknown, record: TreeNode) =>
        record.kind === 'location' && record.roster
          ? formatRosterDate(record.roster.startDate)
          : '',
    },
    {
      title: 'End',
      key: 'endDate',
      width: 150,
      render: (_text: unknown, record: TreeNode) =>
        record.kind === 'location' && record.roster
          ? formatRosterDate(record.roster.endDate)
          : '',
    },
    {
      key: 'action',
      width: 140,
      render: (_text: unknown, record: TreeNode) =>
        record.kind === 'location' && !record.roster ? (
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => {
              newForm.resetFields();
              setCreateFor({
                dutyId: record.dutyId,
                locationId: record.locationId,
              });
              setShowNewFormModal(true);
            }}
          >
            Create roster
          </Button>
        ) : null,
    },
  ];

  if (
    (loading && !data) ||
    (allMSDutiesLoading && !allMSDuties) ||
    (allDutyLocationsLoading && !allDutyLocations)
  ) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="list-container" ref={containerRef}>
        <Table<TreeNode>
          className="list-table"
          rowKey="key"
          dataSource={tree}
          columns={columns}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          expandable={{
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setCollapsedDutyKeys(current =>
                expanded
                  ? current.filter(key => key !== record.key)
                  : [...current, record.key]
              );
            },
          }}
          title={() => (
            <div className="list-table-header">
              <Space size={12}>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => {
                    newForm.resetFields();
                    setCreateFor(null);
                    setShowNewFormModal(true);
                  }}
                >
                  New Roster
                </Button>
              </Space>
              <div className="list-table-header-utilities">
                <ListFilter
                  setPageParams={setPageParams}
                  refreshData={async () => {
                    await refetch();
                    message.success('Data Reloaded', 2);
                  }}
                  dutyId={dutyId}
                  locationId={locationId}
                />
                <DutyRostersFilterChips
                  setPageParams={setPageParams}
                  dutyId={dutyId}
                  locationId={locationId}
                  dutyName={dutyName ?? undefined}
                  locationName={locationName ?? undefined}
                />
              </div>
            </div>
          )}
        />
      </div>
      <Modal
        title="New Duty Roster"
        open={showNewFormModal}
        width={720}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreate}
        onCancel={() => {
          setShowNewFormModal(false);
          setCreateFor(null);
          newForm.resetFields();
        }}
        destroyOnHidden
      >
        <NewForm
          form={newForm}
          lockDutyLocation={createFor != null}
          initialDutyId={createFor?.dutyId}
          initialLocationId={createFor?.locationId}
        />
      </Modal>
    </>
  );
};

export default List;
