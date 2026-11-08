import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Empty, Flex, Pagination, Spin, Table, Typography } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';
import {
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  SORT_BY,
} from 'meteor/idreesia-common/constants/security/list-options';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import type { WorkspaceNightStaysQuery } from 'meteor/idreesia-common/types/client-operations';
import { getNightStayDate } from 'meteor/idreesia-common/utilities/night-stay-date';
import {
  PersonName,
  SortableColumnHeader,
} from '/imports/ui/modules/helpers/controls';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import ReportFilter, {
  ReportFilterChips,
  type FilterParams,
  type FilterQueryParams,
} from './report-filter';
import { WORKSPACE_NIGHT_STAYS } from './gql';

type NightStay = NonNullable<
  NonNullable<
    NonNullable<WorkspaceNightStaysQuery['workspaceNightStays']>['data']
  >[number]
>;

type SortOrder = 'asc' | 'desc';

interface PageParams extends FilterParams {
  sortBy?: string;
  sortOrder?: string;
  pageSize?: number;
}

const PARAM_NAMES = [
  'stayDate',
  'name',
  'city',
  'stayReason',
  'sortBy',
  'sortOrder',
  'pageIndex',
  'pageSize',
] as const;

const formatStayDate = (value?: string | null) =>
  dayjs(Number(value)).format('DD MMM, YYYY');

const stayReasonName = (id?: string | null) =>
  StayReasons.find((reason) => reason._id === id)?.name ?? '';

/**
 * Workspaces → committee → Night Stay Report: the visitors registered by
 * Security as staying on one night (tonight by default), read-only.
 */
const Report = ({ history, location }: RouteComponentProps) => {
  const { committeeId } = useParams<{ committeeId: string }>();
  // Fixed for the life of the page, so the report doesn't jump to the next
  // night if it is left open past 6 PM.
  const [defaultStayDate] = useState(() =>
    dayjs(getNightStayDate()).format(Formats.DATE_FORMAT)
  );
  const { containerRef, scrollY } = useListScrollY();

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [...PARAM_NAMES],
    paramDefaultValues: {
      stayDate: defaultStayDate,
      sortBy: DEFAULT_SORT_BY,
      sortOrder: DEFAULT_SORT_ORDER,
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
    },
  });

  const param = (name: (typeof PARAM_NAMES)[number]) => {
    const value = queryParams[name];
    return typeof value === 'string' && value !== '' ? value : undefined;
  };

  const stayDate = param('stayDate') ?? defaultStayDate;
  const sortBy = param('sortBy') ?? DEFAULT_SORT_BY;
  const sortOrder = (param('sortOrder') ?? DEFAULT_SORT_ORDER) as SortOrder;
  const pageIndex = Number(param('pageIndex') ?? DEFAULT_PAGE_INDEX);
  const pageSize = Number(param('pageSize') ?? DEFAULT_PAGE_SIZE);

  const { data, loading, error, refetch } = useQuery(WORKSPACE_NIGHT_STAYS, {
    variables: {
      committeeId: committeeId!,
      stayDate,
      name: param('name'),
      city: param('city'),
      stayReason: param('stayReason'),
      sortBy,
      sortOrder,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    skip: !committeeId,
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Spin />
      </Flex>
    );
  }

  if (error && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Empty description={error.message} />
      </Flex>
    );
  }

  const paged = data?.workspaceNightStays;
  const stays = (paged?.data ?? []).filter(
    (stay): stay is NightStay => stay != null && stay._id != null
  );

  const handleSetPageParams = (newParams: PageParams) => {
    setPageParams(newParams as Record<string, string | number | null>);
  };

  const handleSortChange = (key: string, order: SortOrder) => {
    handleSetPageParams({ sortBy: key, sortOrder: order });
  };

  const sortableTitle = (headerKey: string, title: string) => () => (
    <SortableColumnHeader
      headerKey={headerKey}
      title={title}
      sortBy={sortBy}
      sortOrder={sortOrder}
      handleSortChange={handleSortChange}
    />
  );

  const columns = [
    {
      title: sortableTitle(SORT_BY.NAME, 'Name'),
      key: 'name',
      render: (_: unknown, stay: NightStay) => (
        <PersonName
          person={{
            _id: stay.visitorId,
            name: stay.visitorName,
            imageUrl: stay.visitorImageUrl,
            imageThumbnailUrl: stay.visitorImageThumbnailUrl,
          }}
        />
      ),
    },
    {
      title: sortableTitle(SORT_BY.CITY, 'City / Country'),
      key: 'cityCountry',
      width: 220,
      render: (_: unknown, stay: NightStay) =>
        [stay.city, stay.country].filter(Boolean).join(', '),
    },
    {
      title: sortableTitle(SORT_BY.STAY_DATE, 'Stay Details'),
      key: 'stayDetails',
      width: 280,
      render: (_: unknown, stay: NightStay) => {
        const days = stay.numOfDays ?? 0;
        return days > 1
          ? `${days} days - [${formatStayDate(stay.fromDate)} - ${formatStayDate(stay.toDate)}]`
          : `1 day - [${formatStayDate(stay.fromDate)}]`;
      },
    },
    {
      title: 'Stay Reason',
      key: 'stayReason',
      width: 160,
      render: (_: unknown, stay: NightStay) => stayReasonName(stay.stayReason),
    },
    {
      title: 'Allowed By',
      key: 'stayAllowedBy',
      dataIndex: 'stayAllowedBy',
      width: 160,
    },
  ];

  const filterProps = {
    queryParams: queryParams as FilterQueryParams,
    defaultStayDate,
    setPageParams: handleSetPageParams,
    refreshData: refetch,
  };

  const nightLabel = dayjs(stayDate, Formats.DATE_FORMAT).format(
    'ddd, DD MMM YYYY'
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={stays}
        columns={columns}
        loading={loading}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        title={() => (
          <div className="list-table-header">
            <Typography.Text strong>Night of {nightLabel}</Typography.Text>
            <div className="list-table-header-utilities">
              <ReportFilter {...filterProps} />
              <ReportFilterChips {...filterProps} />
            </div>
          </div>
        )}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={(page, size) =>
              handleSetPageParams({ pageIndex: page - 1, pageSize: size })
            }
            total={paged?.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default Report;
