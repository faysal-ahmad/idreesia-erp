import React from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Pagination, Spin, Table, Tooltip } from 'antd';

import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

export type FreeFormKind = 'countries' | 'cities';

export interface FreeFormRow {
  name: string;
  count: number;
  // Cities only: the organization location the city is mapped to.
  locationName?: string | null;
}

interface Props {
  kind: FreeFormKind;
  rows: FreeFormRow[];
  totalResults: number;
  loading: boolean;
  pageIndex: number;
  pageSize: number;
  setPageParams: (params: { pageIndex: string; pageSize: string }) => void;
  // When given, each row gets a rename action.
  onRename?: (name: string) => void;
  // Cities only: show the Location Mapping column.
  showLocationMapping?: boolean;
}

const LABELS: Record<FreeFormKind, { title: string; plural: string }> = {
  countries: { title: 'Country', plural: 'countries' },
  cities: { title: 'City', plural: 'cities' },
};

const ValuesTable = ({
  kind,
  rows,
  totalResults,
  loading,
  pageIndex,
  pageSize,
  setPageParams,
  onRename,
  showLocationMapping,
}: Props) => {
  const { containerRef, scrollY } = useListScrollY();

  const handlePaginationChange = (page: number, size?: number) => {
    setPageParams({
      pageIndex: (page - 1).toString(),
      pageSize: (size ?? pageSize).toString(),
    });
  };

  if (loading && rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns: any[] = [
    { title: LABELS[kind].title, dataIndex: 'name', key: 'name' },
    { title: 'People', dataIndex: 'count', key: 'count', width: 160 },
  ];
  if (showLocationMapping) {
    columns.push({
      title: 'Location Mapping',
      dataIndex: 'locationName',
      key: 'locationName',
      render: (name: string | null | undefined) =>
        name ?? <span style={{ color: '#98a2b3' }}>—</span>,
    });
  }
  if (onRename) {
    columns.push({
      key: 'action',
      width: 96,
      render: (_text: unknown, record: FreeFormRow) => (
        <div className="list-actions-column">
          <Tooltip title="Rename">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => onRename(record.name)}
            />
          </Tooltip>
        </div>
      ),
    });
  }

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="name"
        dataSource={rows}
        columns={columns}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} ${LABELS[kind].plural}`
            }
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
            total={totalResults}
          />
        )}
      />
    </div>
  );
};

export default ValuesTable;
