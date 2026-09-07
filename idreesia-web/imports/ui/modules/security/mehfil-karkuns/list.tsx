import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import {
  Button,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  EditOutlined,
  PrinterOutlined,
  SyncOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
} from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { sortBy } from 'meteor/idreesia-common/utilities/lodash';
import type {
  MehfilByIdQuery,
  MehfilKarkunsByMehfilIdQuery,
} from 'meteor/idreesia-common/types/client-operations';
import {
  PersonName,
  PeopleSelectionButton,
} from '/imports/ui/modules/helpers/controls';
import type { SecurityMehfilDuty } from '/imports/ui/modules/security/common/hooks';

import { MEHFIL_KARKUNS_BY_MEHFIL_ID } from './gql';

const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type MehfilRecord = NonNullable<MehfilByIdQuery['mehfilById']>;

type MehfilKarkun = NonNullable<
  NonNullable<
    MehfilKarkunsByMehfilIdQuery['mehfilKarkunsByMehfilId']
  >[number]
>;

export interface PageParams {
  dutyId?: string;
}

interface ListProps {
  dutyId?: string;
  mehfilId: string;
  mehfilById: MehfilRecord;
  allSecurityMehfilDuties: SecurityMehfilDuty[];
  setPageParams(params: PageParams): void;
  mehfilKarkunsLoading?: boolean;
  mehfilKarkunsByMehfilId?: MehfilKarkun[];
  refetchMehfilKarkuns(): void;
  handleAddMehfilKarkun(karkunId: string, refetchQuery: () => void): void;
  handleEditMehfilKarkun(selectedRows: MehfilKarkun[]): void;
  handleRemoveMehfilKarkun(
    mehfilKarkunId: string,
    refetchQuery: () => void
  ): void;
  handleViewPrintCards(selectedRows: MehfilKarkun[]): void;
  handleViewPrintList(selectedRows: MehfilKarkun[]): void;
}

type ListWithDataProps = Omit<
  ListProps,
  'mehfilKarkunsByMehfilId' | 'refetchMehfilKarkuns' | 'mehfilKarkunsLoading'
>;

const isPastMehfil = (mehfilById: MehfilRecord) => {
  const mehfilDate = dayjs(Number(mehfilById.mehfilDate));
  return (
    dayjs().diff(dayjs(mehfilDate, Formats.DATE_FORMAT), 'days') > 30
  );
};

const List = ({
  dutyId,
  mehfilById,
  allSecurityMehfilDuties,
  setPageParams,
  mehfilKarkunsLoading,
  mehfilKarkunsByMehfilId,
  refetchMehfilKarkuns,
  handleAddMehfilKarkun,
  handleEditMehfilKarkun,
  handleRemoveMehfilKarkun,
  handleViewPrintCards,
  handleViewPrintList,
}: ListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedRows, setSelectedRows] = useState<MehfilKarkun[]>([]);

  const pastMehfil = isPastMehfil(mehfilById);

  const updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const footer = table.querySelector('.ant-table-footer');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 64;

      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit =
          contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit -
            titleBottom -
            theadHeight -
            footerHeight -
            VIEWPORT_BOTTOM_GAP
        )
      );

      setScrollY((prev) =>
        Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
      );
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  const handleDutyChange = (value?: string) => {
    setPageParams({ dutyId: value });
    setSelectedRows([]);
    setPageIndex(0);
  };

  const handleRefresh = () => {
    Promise.resolve(refetchMehfilKarkuns()).then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const onPaginationChange = (page: number, nextPageSize?: number) => {
    setPageIndex(page - 1);
    if (nextPageSize != null) setPageSize(nextPageSize);
  };

  if (mehfilKarkunsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const sortedMehfilKarkuns = sortBy(
    mehfilKarkunsByMehfilId ?? [],
    'karkun.sharedData.name'
  );
  const totalResults = sortedMehfilKarkuns.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = sortedMehfilKarkuns.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      key: 'karkun.name',
      render: (_text: unknown, record: MehfilKarkun) => (
        <PersonName
          person={{
            _id: record._id ?? '',
            name: record.karkun?.sharedData?.name ?? '',
            imageId: record.karkun?.sharedData?.imageId ?? undefined,
            imageThumbnailId:
              record.karkun?.sharedData?.imageThumbnailId ?? undefined,
          }}
          onPersonNameClicked={() => {}}
        />
      ),
    },
    {
      title: 'City',
      key: 'cityCountry',
      width: 140,
      render: (_text: unknown, record: MehfilKarkun) => {
        if (record.karkun?.isKarkun && record.karkun.karkunData?.city) {
          return record.karkun.karkunData.city.name;
        }
        if (record.karkun?.visitorData?.city) {
          return record.karkun.visitorData.city;
        }
        return '';
      },
    },
    {
      title: 'CNIC',
      key: 'cnicNumber',
      width: 150,
      render: (_text: unknown, record: MehfilKarkun) =>
        record.karkun?.sharedData?.cnicNumber,
    },
    {
      title: 'Contact No.',
      key: 'contactNumbers',
      width: 140,
      render: (_text: unknown, record: MehfilKarkun) => {
        const numbers = [
          record.karkun?.sharedData?.contactNumber1,
          record.karkun?.sharedData?.contactNumber2,
        ].filter(Boolean);
        return numbers.length > 0 ? numbers.join(', ') : '';
      },
    },
    {
      title: 'Duty Name',
      dataIndex: 'dutyId',
      key: 'dutyId',
      width: 160,
      render: (text: string | null) => {
        const duty = allSecurityMehfilDuties.find(
          (mehfilDuty) => mehfilDuty._id === text
        );
        return duty?.name;
      },
    },
    {
      title: 'Duty Detail',
      dataIndex: 'dutyDetail',
      key: 'dutyDetail',
    },
  ];

  if (!pastMehfil) {
    columns.push({
      key: 'action',
      width: 56,
      render: (_text: unknown, record: MehfilKarkun) => (
        <div className="list-actions-column">
          <Popconfirm
            title="Are you sure you want to remove this karkun?"
            onConfirm={() => {
              handleRemoveMehfilKarkun(record._id ?? '', refetchMehfilKarkuns);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Remove Karkun">
              <UsergroupDeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    });
  }

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12} wrap>
        <PeopleSelectionButton
          icon={<UsergroupAddOutlined />}
          label="Add Karkuns"
          onSelection={(karkun: { _id: string }) => {
            handleAddMehfilKarkun(karkun._id, refetchMehfilKarkuns);
          }}
          disabled={pastMehfil || !dutyId}
        />
        <Button
          disabled={pastMehfil || selectedRows.length === 0}
          icon={<EditOutlined />}
          onClick={() => handleEditMehfilKarkun(selectedRows)}
        >
          Edit Duty Detail
        </Button>
        <Button
          disabled={pastMehfil}
          icon={<PrinterOutlined />}
          onClick={() => handleViewPrintCards(selectedRows)}
        >
          Print Cards
        </Button>
        <Button
          disabled={pastMehfil}
          icon={<PrinterOutlined />}
          onClick={() => handleViewPrintList(selectedRows)}
        >
          Print List
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Select
            value={dutyId || undefined}
            placeholder="Filter by duty"
            style={{ width: 280 }}
            onChange={handleDutyChange}
            allowClear
            options={allSecurityMehfilDuties.map((duty) => ({
              value: duty._id ?? '',
              label: `${duty.name} - ${duty.mehfilUsedCount}`,
            }))}
          />
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        size="medium"
        title={getTableHeader}
        columns={columns}
        rowSelection={
          !pastMehfil
            ? {
                selectedRowKeys: selectedRows
                  .map((row) => row._id)
                  .filter((id): id is string => id != null),
                onChange: (_keys, rows) => {
                  // Keep selections from other pages; replace only this page.
                  const pageIds = new Set(
                    pageData.map((row) => row._id).filter(Boolean)
                  );
                  const kept = selectedRows.filter(
                    (row) => row._id != null && !pageIds.has(row._id)
                  );
                  setSelectedRows([...kept, ...rows]);
                },
              }
            : undefined
        }
        dataSource={pageData}
        bordered
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={safePageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onPaginationChange}
            onShowSizeChange={onPaginationChange}
            total={totalResults}
          />
        )}
      />
    </div>
  );
};

const ListWithData = (props: ListWithDataProps) => {
  const { mehfilId, dutyId } = props;
  const { data, loading, refetch } = useQuery(MEHFIL_KARKUNS_BY_MEHFIL_ID, {
    fetchPolicy: 'cache-and-network',
    variables: {
      mehfilId,
      dutyId,
    },
  });

  const mehfilKarkunsByMehfilId = (data?.mehfilKarkunsByMehfilId ?? []).filter(
    (row): row is MehfilKarkun => row != null
  );

  return (
    <List
      {...props}
      mehfilKarkunsByMehfilId={mehfilKarkunsByMehfilId}
      mehfilKarkunsLoading={loading}
      refetchMehfilKarkuns={refetch}
    />
  );
};

export default ListWithData;
