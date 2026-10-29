import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Button, Dropdown, Segmented, Space, Spin } from 'antd';
import {
  FileImageOutlined,
  SettingOutlined,
  SyncOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { Formats } from 'meteor/idreesia-common/constants';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/antd-feedback';

import {
  ALL_SECURITY_SERVER_CHANNELS,
  CREATE_MISSING_SECURITY_SERVER_ALERT_THUMBNAILS,
  PAGED_SECURITY_SERVER_ALERT_GROUPS,
  PAGED_SECURITY_SERVER_ALERTS,
  PAGED_SECURITY_SERVER_PROFILES,
} from '../../gql';
import AlertsTable, { type AlertRow } from '../../common/alerts-table';
import FilterChips from '../../common/filter-chips';
import useCanManage from '../../common/use-can-manage';
import useListScrollY from '../../common/use-list-scroll-y';
import AlertModal from '../alert-modal';
import AlertGroupsTable, { type AlertGroupRow } from './alert-groups-table';
import ListFilter, {
  getAlertFilterChips,
  type AlertFilterParams,
  type NamedOption,
} from './list-filter';

const FILTER_PARAM_NAMES = [
  'profileId',
  'channelId',
  'review',
  'startDate',
  'endDate',
  'includeTest',
];

// Written for a date the user cleared, as opposed to a blank one (today).
const ANY_DATE = 'any';

// 'grouped' rolls the alerts up per person; anything else is the flat list.
const GROUPED_VIEW = 'grouped';
const VIEW_OPTIONS = [
  { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
  { label: 'By Person', value: GROUPED_VIEW, icon: <TeamOutlined /> },
];

// Profiles are a short watch list, so the filter dropdown loads them all.
const ALL_PROFILES_PAGE_SIZE = '1000';

const toNamedOptions = (
  rows:
    | ReadonlyArray<{ _id?: string | null; name?: string | null } | null>
    | null
    | undefined
): NamedOption[] =>
  (rows ?? []).flatMap(row =>
    row?._id ? [{ _id: row._id, name: row.name ?? '' }] : []
  );

type Props = RouteComponentProps;

const List = ({ history, location }: Props) => {
  useBreadcrumbs(['Security', 'Security Server', 'Alerts']);
  const { containerRef, scrollY } = useListScrollY();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const canManage = useCanManage();
  const [createMissingThumbnails, { loading: creatingThumbnails }] =
    useMutation(CREATE_MISSING_SECURITY_SERVER_ALERT_THUMBNAILS);

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [...FILTER_PARAM_NAMES, 'view', 'pageIndex', 'pageSize'],
  });
  const {
    profileId,
    channelId,
    review,
    startDate: urlStartDate,
    endDate: urlEndDate,
    includeTest,
    view,
    pageIndex,
    pageSize,
  } = queryParams as Record<string, string | undefined>;
  const isGrouped = view === GROUPED_VIEW;

  // A blank date means today, so a fresh visit (and any older URL, where the
  // dates were written blank) shows today's alerts. A date the user cleared
  // is written as ANY_DATE instead, so it stays cleared.
  const today = dayjs().format(Formats.DATE_FORMAT);
  const toFilterDate = (value?: string) =>
    value === ANY_DATE ? null : value || today;
  const startDate = toFilterDate(urlStartDate);
  const endDate = toFilterDate(urlEndDate);
  const setParams = (params: Record<string, string | number | null>) => {
    const next = { startDate, endDate, ...params };
    setPageParams({
      ...next,
      startDate: next.startDate || ANY_DATE,
      endDate: next.endDate || ANY_DATE,
    });
  };

  const filterParams: AlertFilterParams = {
    profileId,
    channelId,
    review,
    startDate,
    endDate,
    includeTest,
  };

  const pageFilter = { ...filterParams, pageIndex, pageSize };
  const alertsQuery = useQuery(PAGED_SECURITY_SERVER_ALERTS, {
    variables: { filter: pageFilter },
    skip: isGrouped,
  });
  const groupsQuery = useQuery(PAGED_SECURITY_SERVER_ALERT_GROUPS, {
    variables: { filter: pageFilter },
    skip: !isGrouped,
  });
  const { data, loading, refetch } = isGrouped ? groupsQuery : alertsQuery;
  const { data: profilesData, loading: profilesLoading } = useQuery(
    PAGED_SECURITY_SERVER_PROFILES,
    {
      variables: {
        filter: {
          includeTest: 'true',
          includeDeleted: 'true',
          pageSize: ALL_PROFILES_PAGE_SIZE,
        },
      },
    }
  );
  const { data: channelsData, loading: channelsLoading } = useQuery(
    ALL_SECURITY_SERVER_CHANNELS,
    { variables: { includeDeleted: true } }
  );

  // Only the first load replaces the page; later refetches (e.g. after a
  // review is saved in the modal) keep the table and modal mounted.
  if ((loading && !data) || profilesLoading || channelsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const profiles = toNamedOptions(
    profilesData?.pagedSecurityServerProfiles?.data
  );
  const channels = toNamedOptions(channelsData?.allSecurityServerChannels);
  const pagedAlerts = alertsQuery.data?.pagedSecurityServerAlerts;
  const rows = (pagedAlerts?.data ?? []).filter(
    (row): row is AlertRow => row != null
  );
  const pagedGroups = groupsQuery.data?.pagedSecurityServerAlertGroups;
  const groupRows = (pagedGroups?.data ?? []).filter(
    (row): row is AlertGroupRow => row != null
  );

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  const handleCreateMissingThumbnails = () => {
    const hide = message.loading('Creating missing thumbnails...', 0);
    createMissingThumbnails()
      .then(({ data: result }) => {
        hide();
        const created =
          result?.createMissingSecurityServerAlertThumbnails ?? 0;
        message.success(
          created === 1
            ? 'Created 1 thumbnail.'
            : `Created ${created} thumbnails.`,
          3
        );
        refetch();
      })
      .catch((error: Error) => {
        hide();
        message.error(error.message, 5);
      });
  };

  const getActionsMenu = () => (
    <Dropdown
      disabled={creatingThumbnails}
      menu={{
        items: [
          {
            key: 'create-missing-thumbnails',
            label: (
              <>
                <FileImageOutlined />
                &nbsp; Create missing thumbnails
              </>
            ),
            onClick: handleCreateMissingThumbnails,
          },
        ],
      }}
    >
      <Button icon={<SettingOutlined />} loading={creatingThumbnails} />
    </Dropdown>
  );

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Segmented
          options={VIEW_OPTIONS}
          value={isGrouped ? GROUPED_VIEW : 'list'}
          onChange={nextView =>
            setParams({
              view: nextView === GROUPED_VIEW ? GROUPED_VIEW : null,
              pageIndex: 0,
            })
          }
        />
      </div>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter
            queryParams={filterParams}
            profiles={profiles}
            channels={channels}
            setPageParams={setParams}
          />
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
          {canManage ? getActionsMenu() : null}
        </Space>
        <FilterChips
          chips={getAlertFilterChips(filterParams, profiles, channels)}
          onClear={key => setParams({ [key]: null, pageIndex: 0 })}
          onClearAll={() =>
            setParams({
              ...Object.fromEntries(FILTER_PARAM_NAMES.map(key => [key, null])),
              pageIndex: 0,
            })
          }
        />
      </div>
    </div>
  );

  const paging = {
    pageIndex: pageIndex ? toSafeInteger(pageIndex) : 0,
    pageSize: pageSize ? toSafeInteger(pageSize) : 20,
    onPageChange: (nextPageIndex: number, nextPageSize: number) =>
      setParams({ pageIndex: nextPageIndex, pageSize: nextPageSize }),
  };
  const openAlert = (row: AlertRow) => setSelectedAlertId(row._id ?? null);

  return (
    <div className="list-container" ref={containerRef}>
      {isGrouped ? (
        <AlertGroupsTable
          rows={groupRows}
          totalResults={pagedGroups?.totalResults ?? 0}
          {...paging}
          onAlertClick={openAlert}
          filterParams={filterParams}
          loading={loading}
          title={getTableHeader}
          scrollY={scrollY}
        />
      ) : (
        <AlertsTable
          rows={rows}
          totalResults={pagedAlerts?.totalResults ?? 0}
          {...paging}
          onRowClick={openAlert}
          loading={loading}
          title={getTableHeader}
          scrollY={scrollY}
        />
      )}
      <AlertModal
        alertId={selectedAlertId}
        onClose={() => setSelectedAlertId(null)}
      />
    </div>
  );
};

export default List;
