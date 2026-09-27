import React, { useEffect, useRef, useState } from 'react';
import { type History } from 'history';
import { type RouteComponentProps } from 'react-router';
import {
  useApolloClient,
  useMutation,
  useQuery,
} from '@apollo/client/react';
import { DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  Button,
  Pagination,
  Popconfirm,
  Popover,
  Space,
  Spin,
  Table,
  Tabs,
} from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { message } from '/imports/ui/antd-feedback';
import type {
  DuplicateCnicsQuery,
  DuplicatePersonRelationCountsQuery,
  DuplicatePhoneNumbersQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import RelationCountsTable from '../deleted-people/relation-counts-table';
import {
  DELETE_DUPLICATE_PEOPLE,
  DUPLICATE_CNICS,
  DUPLICATE_PERSON_RELATION_COUNTS,
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
type PersonRelationCounts =
  NonNullable<DuplicatePersonRelationCountsQuery['duplicatePersonRelationCounts']>[number];

const getMemberColumns = (
  history: History,
  relationCountsByPersonId: Record<string, PersonRelationCounts>,
  relationCountsLoading: boolean
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
    title: 'Relationships',
    key: 'relationshipsCount',
    width: 130,
    render: (_text: unknown, record: DuplicatePersonSummary) => {
      const relationCounts = record._id
        ? relationCountsByPersonId[record._id]
        : undefined;
      if (!relationCounts) {
        return relationCountsLoading ? <Spin size="small" /> : '-';
      }

      return (
        <Popover
          trigger="click"
          placement="left"
          content={
            <div style={{ width: 640 }}>
              <RelationCountsTable counts={relationCounts.counts} />
            </div>
          }
        >
          <Button type="link" size="small">
            {relationCounts.total}
          </Button>
        </Popover>
      );
    },
  },
];

interface GroupMembersTableProps {
  group: DuplicateGroup;
  history: History;
  selectedPersonIds: string[];
  setSelectedPersonIds: React.Dispatch<React.SetStateAction<string[]>>;
}

// Rendered only when a group is expanded, so relation counts are fetched
// lazily - one small query per expanded group rather than for every group.
const GroupMembersTable = ({
  group,
  history,
  selectedPersonIds,
  setSelectedPersonIds,
}: GroupMembersTableProps) => {
  const people = (group.people ?? []).filter(
    (person): person is DuplicatePersonSummary => person != null
  );
  const groupPersonIds = people
    .map((person) => person._id)
    .filter((_id): _id is string => !!_id);

  const { data, loading } = useQuery(DUPLICATE_PERSON_RELATION_COUNTS, {
    variables: { ids: groupPersonIds },
    skip: groupPersonIds.length === 0,
  });
  const relationCountsByPersonId = Object.fromEntries(
    (data?.duplicatePersonRelationCounts ?? []).map((item) => [
      item.personId,
      item,
    ])
  );

  return (
    <Table
      className="list-table"
      rowKey="_id"
      dataSource={people}
      columns={getMemberColumns(history, relationCountsByPersonId, loading)}
      bordered
      size="middle"
      tableLayout="fixed"
      pagination={false}
      rowSelection={{
        columnWidth: 48,
        selectedRowKeys: selectedPersonIds.filter((_id) =>
          groupPersonIds.includes(_id)
        ),
        onChange: (selectedRowKeys: React.Key[]) => {
          // Replace only this group's selection; keep other groups' keys.
          setSelectedPersonIds((prev) => {
            const next = new Set(
              prev.filter((_id) => !groupPersonIds.includes(_id))
            );
            selectedRowKeys.forEach((key) => next.add(String(key)));
            return Array.from(next);
          });
        },
      }}
    />
  );
};

interface GroupTableProps {
  groups: DuplicateGroup[];
  loading: boolean;
  valueColumnTitle: string;
  history: History;
  selectedPersonIds: string[];
  setSelectedPersonIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const GroupTable = ({
  groups,
  loading,
  valueColumnTitle,
  history,
  selectedPersonIds,
  setSelectedPersonIds,
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

  const expandedRowRender = (record: DuplicateGroup) => (
    <GroupMembersTable
      group={record}
      history={history}
      selectedPersonIds={selectedPersonIds}
      setSelectedPersonIds={setSelectedPersonIds}
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
  const client = useApolloClient();

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

  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);

  const [deleteDuplicatePeople, { loading: deletingPeople }] = useMutation(
    DELETE_DUPLICATE_PEOPLE,
    {
      refetchQueries: ['duplicateCnics', 'duplicatePhoneNumbers'],
    }
  );

  const handleDeleteSelected = () => {
    if (selectedPersonIds.length === 0) return;
    deleteDuplicatePeople({
      variables: { _ids: selectedPersonIds },
    })
      .then(() => {
        message.success(`Deleted ${selectedPersonIds.length} people`, 2);
        setSelectedPersonIds([]);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleRefresh = () => {
    Promise.all([
      refetchCnics(),
      refetchPhoneNumbers(),
      client.refetchQueries({ include: ['duplicatePersonRelationCounts'] }),
    ]).then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  return (
    <Tabs
      destroyOnHidden
      onChange={() => setSelectedPersonIds([])}
      tabBarExtraContent={
        <Space size={8}>
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
          <Popconfirm
            title={`Are you sure you want to delete ${selectedPersonIds.length} selected people?`}
            onConfirm={handleDeleteSelected}
            okText="Yes"
            cancelText="No"
            disabled={selectedPersonIds.length === 0}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedPersonIds.length === 0}
              loading={deletingPeople}
              title="Delete Selected"
            >
              {selectedPersonIds.length > 0
                ? `Delete (${selectedPersonIds.length})`
                : 'Delete'}
            </Button>
          </Popconfirm>
        </Space>
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
              selectedPersonIds={selectedPersonIds}
              setSelectedPersonIds={setSelectedPersonIds}
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
              selectedPersonIds={selectedPersonIds}
              setSelectedPersonIds={setSelectedPersonIds}
            />
          ),
        },
      ]}
    />
  );
};

export default List;
