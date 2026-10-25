import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Button, Space, Spin } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/antd-feedback';

import {
  ALL_SECURITY_SERVER_CHANNELS,
  PAGED_SECURITY_SERVER_ALERTS,
  PAGED_SECURITY_SERVER_PROFILES,
} from '../../gql';
import AlertsTable, { type AlertRow } from '../../common/alerts-table';
import FilterChips from '../../common/filter-chips';
import useListScrollY from '../../common/use-list-scroll-y';
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

// Profiles are a short watch list, so the filter dropdown loads them all.
const ALL_PROFILES_PAGE_SIZE = '1000';

const toNamedOptions = (
  rows: ReadonlyArray<{ _id?: string | null; name?: string | null } | null> | null | undefined
): NamedOption[] =>
  (rows ?? []).flatMap(row =>
    row?._id ? [{ _id: row._id, name: row.name ?? '' }] : []
  );

type Props = RouteComponentProps;

const List = ({ history, location }: Props) => {
  useBreadcrumbs(['Security', 'Security Server', 'Alerts']);
  const { containerRef, scrollY } = useListScrollY();

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [...FILTER_PARAM_NAMES, 'pageIndex', 'pageSize'],
  });
  const {
    profileId,
    channelId,
    review,
    startDate,
    endDate,
    includeTest,
    pageIndex,
    pageSize,
  } = queryParams as Record<string, string | undefined>;
  const filterParams: AlertFilterParams = {
    profileId,
    channelId,
    review,
    startDate,
    endDate,
    includeTest,
  };

  const { data, loading, refetch } = useQuery(PAGED_SECURITY_SERVER_ALERTS, {
    variables: { filter: { ...filterParams, pageIndex, pageSize } },
  });
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

  if (loading || profilesLoading || channelsLoading) {
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
  const pagedAlerts = data?.pagedSecurityServerAlerts;
  const rows = (pagedAlerts?.data ?? []).filter(
    (row): row is AlertRow => row != null
  );

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section" />
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter
            queryParams={filterParams}
            profiles={profiles}
            channels={channels}
            setPageParams={setPageParams}
          />
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
        <FilterChips
          chips={getAlertFilterChips(filterParams, profiles, channels)}
          onClear={key => setPageParams({ [key]: null, pageIndex: 0 })}
          onClearAll={() =>
            setPageParams({
              ...Object.fromEntries(FILTER_PARAM_NAMES.map(key => [key, null])),
              pageIndex: 0,
            })
          }
        />
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <AlertsTable
        rows={rows}
        totalResults={pagedAlerts?.totalResults ?? 0}
        pageIndex={pageIndex ? toSafeInteger(pageIndex) : 0}
        pageSize={pageSize ? toSafeInteger(pageSize) : 20}
        onPageChange={(nextPageIndex, nextPageSize) =>
          setPageParams({ pageIndex: nextPageIndex, pageSize: nextPageSize })
        }
        title={getTableHeader}
        scrollY={scrollY}
      />
    </div>
  );
};

export default List;
