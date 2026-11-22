import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Input, Pagination, Row, Space, Table } from 'antd';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { PAGED_MEHFIL_KARKUNS } from './gql';

const DEFAULT_PAGE_SIZE = 20;

// The karkuns whose mehfil is this location.
const MehfilKarkunsPage = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { containerRef, scrollY } = useListScrollY();

  const { data, loading, refetch } = useQuery(PAGED_MEHFIL_KARKUNS, {
    variables: {
      locationId: locationId!,
      name: name || undefined,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    skip: !locationId,
    fetchPolicy: 'cache-and-network',
  });

  const karkuns = data?.pagedMehfilKarkuns?.data ?? [];
  const totalResults = data?.pagedMehfilKarkuns?.totalResults ?? 0;

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_text: unknown, record: (typeof karkuns)[number]) => (
        <PersonName person={record} />
      ),
    },
    { title: 'Parent Name', dataIndex: 'parentName', key: 'parentName' },
    { title: 'CNIC', dataIndex: 'cnicNumber', key: 'cnicNumber' },
    {
      title: 'Contact Number',
      key: 'contactNumber',
      render: (_text: unknown, record: (typeof karkuns)[number]) => (
        <>
          {record.contactNumber1 ? <Row>{record.contactNumber1}</Row> : null}
          {record.contactNumber2 ? <Row>{record.contactNumber2}</Row> : null}
        </>
      ),
    },
  ];

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={karkuns}
        columns={columns}
        loading={loading}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        locale={{ emptyText: 'No karkuns in this mehfil' }}
        title={() => (
          <div className="list-table-header">
            <div />
            <div className="list-table-header-utilities">
              <Space size={8}>
                <Input.Search
                  allowClear
                  placeholder="Search by name"
                  style={{ width: 240 }}
                  onSearch={value => {
                    setName(value.trim());
                    setPageIndex(0);
                  }}
                />
                <Button
                  icon={<SyncOutlined />}
                  onClick={() => refetch()}
                  title="Reload Data"
                />
              </Space>
            </div>
          </div>
        )}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            total={totalResults}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} karkuns`
            }
            onChange={(page, size) => {
              setPageIndex(page - 1);
              setPageSize(size);
            }}
          />
        )}
      />
    </div>
  );
};

export default MehfilKarkunsPage;
