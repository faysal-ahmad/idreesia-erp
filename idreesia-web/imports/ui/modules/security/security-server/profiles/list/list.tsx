import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Button, Image, Pagination, Space, Spin, Table, Tag } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import type { PagedSecurityServerProfilesQuery } from 'meteor/idreesia-common/types/client-operations';
import { message } from '/imports/ui/antd-feedback';

import paths from '../../../submodule-paths';
import { PAGED_SECURITY_SERVER_PROFILES } from '../../gql';
import FilterChips from '../../common/filter-chips';
import useListScrollY from '../../common/use-list-scroll-y';
import { formatDateTime } from '../../common/format';
import ListFilter, {
  getProfileFilterChips,
  type ProfileFilterParams,
} from './list-filter';

type ProfileRow = NonNullable<
  NonNullable<
    NonNullable<
      PagedSecurityServerProfilesQuery['pagedSecurityServerProfiles']
    >['data']
  >[number]
>;

const columns = [
  {
    title: 'Image',
    key: 'image',
    width: 100,
    render: (_text: unknown, record: ProfileRow) => {
      const imageUrl = record.images?.[0]?.imageUrl;
      return imageUrl ? (
        <Image
          className="security-server-profile-thumb"
          src={imageUrl}
          alt={record.name ?? ''}
        />
      ) : null;
    },
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: ProfileRow) => (
      <>
        <Link to={paths.securityServerProfileViewPath(record._id!)}>{text}</Link>
        {record.isTest ? (
          <Tag className="security-server-inline-tag">Test</Tag>
        ) : null}
        {record.deletedAt ? (
          <Tag className="security-server-inline-tag" color="red">
            Deleted
          </Tag>
        ) : null}
      </>
    ),
  },
  {
    title: 'Images',
    key: 'imagesCount',
    width: 100,
    render: (_text: unknown, record: ProfileRow) => record.images?.length ?? 0,
  },
  {
    title: 'Alerts',
    dataIndex: 'alertsCount',
    key: 'alertsCount',
    width: 100,
  },
  {
    title: 'Last Updated',
    key: 'lastUpdated',
    width: 200,
    render: (_text: unknown, record: ProfileRow) =>
      formatDateTime(record.externalUpdatedAt ?? record.updatedAt),
  },
];

const FILTER_PARAM_NAMES = ['name', 'includeTest', 'includeDeleted'];

type Props = RouteComponentProps;

const List = ({ history, location }: Props) => {
  useBreadcrumbs(['Security', 'Security Server', 'Profiles']);
  const { containerRef, scrollY } = useListScrollY();

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [...FILTER_PARAM_NAMES, 'pageIndex', 'pageSize'],
  });
  const { name, includeTest, includeDeleted, pageIndex, pageSize } =
    queryParams as Record<string, string | undefined>;
  const filterParams: ProfileFilterParams = { name, includeTest, includeDeleted };

  const { data, loading, refetch } = useQuery(PAGED_SECURITY_SERVER_PROFILES, {
    variables: {
      filter: { name, includeTest, includeDeleted, pageIndex, pageSize },
    },
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const pagedProfiles = data?.pagedSecurityServerProfiles;
  const rows = (pagedProfiles?.data ?? []).filter(
    (row): row is ProfileRow => row != null
  );
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section" />
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter queryParams={filterParams} setPageParams={setPageParams} />
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
        <FilterChips
          chips={getProfileFilterChips(filterParams)}
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
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={rows}
        columns={columns}
        title={getTableHeader}
        size="middle"
        bordered
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={numPageIndex + 1}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={(page, size) =>
              setPageParams({ pageIndex: page - 1, pageSize: size })
            }
            total={pagedProfiles?.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
