import React, { useEffect, useRef, useState } from 'react';
import { type History } from 'history';
import { type RouteComponentProps } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  Button,
  Pagination,
  Popconfirm,
  Spin,
  Table,
  Tabs,
  Tooltip,
} from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { message } from '/imports/ui/antd-feedback';
import type {
  DuplicateCnicsQuery,
  DuplicatePhoneNumbersQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import {
  DELETE_DUPLICATE_PERSON,
  DUPLICATE_CNICS,
  DUPLICATE_PHONE_NUMBERS,
} from './gql';

const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type DuplicateCnicGroup = NonNullable<
  NonNullable<DuplicateCnicsQuery['duplicateCnics']>[number]
>;
type DuplicatePhoneGroup = NonNullable<
  NonNullable<DuplicatePhoneNumbersQuery['duplicatePhoneNumbers']>[number]
>;
type DuplicateGroup = DuplicateCnicGroup | DuplicatePhoneGroup;
type DuplicatePersonSummary = NonNullable<
  NonNullable<DuplicateGroup['people']>[number]
>;

const getMemberColumns = (
  history: History,
  handleDeleteItem: (personId: string) => void
): any[] => [
  {
    title: 'ID',
    dataIndex: '_id',
    key: '_id',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (_text: string, record: DuplicatePersonSummary) => (
      <PersonName
        person={{
          _id: record._id,
          name: record.name,
          imageId: record.imageId,
          imageThumbnailId: record.imageThumbnailId,
        }}
        onPersonNameClicked={() => {
          history.push(paths.duplicatePersonEditFormPath(record._id ?? ''));
        }}
      />
    ),
  },
  {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
  },
  {
    title: 'Phone 1',
    dataIndex: 'contactNumber1',
    key: 'contactNumber1',
  },
  {
    title: 'Phone 2',
    dataIndex: 'contactNumber2',
    key: 'contactNumber2',
  },
  {
    title: 'Updated At',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (text: string | number | null | undefined) => {
      if (!text) return '';
      return dayjs(Number(text)).format(Formats.DATE_TIME_FORMAT);
    },
  },
  {
    key: 'action',
    width: 56,
    render: (_text: unknown, record: DuplicatePersonSummary) => (
      <div className="list-actions-column">
        <Popconfirm
          title="Are you sure you want to delete this person?"
          onConfirm={() => {
            if (record._id) handleDeleteItem(record._id);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <DeleteOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  },
];

interface GroupTableProps {
  groups: DuplicateGroup[];
  loading: boolean;
  valueColumnTitle: string;
  history: History;
  handleDeleteItem: (personId: string) => void;
}

const GroupTable = ({
  groups,
  loading,
  valueColumnTitle,
  history,
  handleDeleteItem,
}: GroupTableProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);

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
        bottomLimit = contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit - titleBottom - theadHeight - footerHeight - VIEWPORT_BOTTOM_GAP
        )
      );

      setScrollY((prev) => (Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev));
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalResults = groups.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = groups.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const onPaginationChange = (page: number, nextPageSize?: number) => {
    setPageIndex(page - 1);
    if (nextPageSize != null) setPageSize(nextPageSize);
  };

  const columns: any[] = [
    {
      title: valueColumnTitle,
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '# of People',
      dataIndex: 'count',
      key: 'count',
      width: 140,
    },
  ];

  const memberColumns = getMemberColumns(history, handleDeleteItem);
  const expandedRowRender = (record: DuplicateGroup) => (
    <Table
      className="list-table"
      rowKey="_id"
      dataSource={(record.people ?? []).filter(
        (person): person is DuplicatePersonSummary => person != null
      )}
      columns={memberColumns}
      bordered
      size="middle"
      tableLayout="fixed"
      pagination={false}
    />
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="value"
        dataSource={pageData}
        columns={columns}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        expandable={{ expandedRowRender }}
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

type Props = RouteComponentProps;

const List = ({ history }: Props) => {
  useBreadcrumbs(['Admin', 'Data Management', 'Duplicate People']);

  const {
    data: cnicData,
    loading: cnicLoading,
    refetch: refetchCnics,
  } = useQuery(DUPLICATE_CNICS);
  const {
    data: phoneData,
    loading: phoneLoading,
    refetch: refetchPhoneNumbers,
  } = useQuery(DUPLICATE_PHONE_NUMBERS);

  const duplicateCnics = (cnicData?.duplicateCnics ?? []).filter(
    (group): group is DuplicateCnicGroup => group != null
  );
  const duplicatePhoneNumbers = (
    phoneData?.duplicatePhoneNumbers ?? []
  ).filter((group): group is DuplicatePhoneGroup => group != null);

  const [deleteDuplicatePerson] = useMutation(DELETE_DUPLICATE_PERSON, {
    refetchQueries: ['duplicateCnics', 'duplicatePhoneNumbers'],
  });

  const handleDeleteItem = (personId: string) => {
    deleteDuplicatePerson({
      variables: { _id: personId },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleRefresh = () => {
    Promise.all([refetchCnics(), refetchPhoneNumbers()]).then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  return (
    <Tabs
      destroyOnHidden
      tabBarExtraContent={
        <Button
          icon={<SyncOutlined />}
          onClick={handleRefresh}
          title="Reload Data"
        />
      }
      items={[
        {
          key: 'cnics',
          label: 'Duplicate CNICs',
          children: (
            <GroupTable
              groups={duplicateCnics}
              loading={cnicLoading}
              valueColumnTitle="CNIC Number"
              history={history}
              handleDeleteItem={handleDeleteItem}
            />
          ),
        },
        {
          key: 'phone-numbers',
          label: 'Duplicate Phone Numbers',
          children: (
            <GroupTable
              groups={duplicatePhoneNumbers}
              loading={phoneLoading}
              valueColumnTitle="Phone Number"
              history={history}
              handleDeleteItem={handleDeleteItem}
            />
          ),
        },
      ]}
    />
  );
};

export default List;
