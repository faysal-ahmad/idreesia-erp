import React, { useState } from 'react';
import { type History } from 'history';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, Pagination, Space, Spin, Table, Tabs } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { message } from '/imports/ui/antd-feedback';
import type {
  DuplicateCnicsQuery,
  DuplicatePhoneNumbersQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import { DUPLICATE_CNICS, DUPLICATE_PHONE_NUMBERS } from './gql';

const DEFAULT_PAGE_SIZE = 20;

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

const getMemberColumns = (history: History): any[] => [
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
];

interface GroupTableProps {
  groups: DuplicateGroup[];
  loading: boolean;
  valueColumnTitle: string;
  history: History;
}

const GroupTable = ({
  groups,
  loading,
  valueColumnTitle,
  history,
}: GroupTableProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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

  const memberColumns = getMemberColumns(history);
  const expandedRowRender = (record: DuplicateGroup) => (
    <Table
      className="list-table"
      rowKey="_id"
      dataSource={(record.people ?? []).filter(
        (person): person is DuplicatePersonSummary => person != null
      )}
      columns={memberColumns}
      bordered
      size="small"
      tableLayout="fixed"
      pagination={false}
    />
  );

  return (
    <Table
      className="list-table"
      rowKey="value"
      dataSource={pageData}
      columns={columns}
      bordered
      size="middle"
      tableLayout="fixed"
      pagination={false}
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

  const handleRefresh = () => {
    Promise.all([refetchCnics(), refetchPhoneNumbers()]).then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  return (
    <div className="list-container">
      <div className="list-table-header" style={{ marginBottom: 12 }}>
        <div className="list-table-header-section" />
        <div className="list-table-header-utilities">
          <Space size={8}>
            <Button
              icon={<SyncOutlined />}
              onClick={handleRefresh}
              title="Reload Data"
            />
          </Space>
        </div>
      </div>
      <Tabs
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
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default List;
