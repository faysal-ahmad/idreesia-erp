import React from 'react';
import { Spin, Table } from 'antd';

export interface RelationCountItem {
  name: string;
  count: number;
}

interface Props {
  counts: RelationCountItem[];
  loading?: boolean;
}

// Relations that are not owned by the person - a deleted person can only be
// hard-deleted once none of these have a non-zero count. User Account blocks
// deletion too: createdBy/updatedBy/deletedBy fields across the app store
// the linked Users._id, which a hard delete has no way to find and clean up
// everywhere it's referenced.
export const NOT_OWNED_RELATION_NAMES = new Set([
  'Salary Records',
  'Issuance Forms',
  'Purchase Forms',
  'Stock Adjustments',
  'User Account',
]);

export const hasOnlyOwnedRelations = (counts: RelationCountItem[]) =>
  counts.every(
    item => !NOT_OWNED_RELATION_NAMES.has(item.name) || item.count === 0
  );

const columns = [
  { title: 'Relation', dataIndex: 'name', key: 'name' },
  { title: 'Count', dataIndex: 'count', key: 'count', width: 120 },
];

const getRowClassName = (record: RelationCountItem) =>
  record.count > 0 ? 'relation-counts-row-not-owned' : '';

const RelationCountsTable = ({ counts, loading }: Props) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <Spin />
      </div>
    );
  }

  const ownedCounts = counts.filter(
    (item) => !NOT_OWNED_RELATION_NAMES.has(item.name)
  );
  const notOwnedCounts = counts.filter((item) =>
    NOT_OWNED_RELATION_NAMES.has(item.name)
  );

  return (
    <div className="relation-counts-table-group">
      <div className="relation-counts-table-column">
        <div className="relation-counts-table-heading">Owned Data</div>
        <Table
          className="list-table"
          rowKey="name"
          dataSource={ownedCounts}
          columns={columns}
          bordered
          size="small"
          tableLayout="fixed"
          pagination={false}
        />
      </div>
      <div className="relation-counts-table-column">
        <div className="relation-counts-table-heading">Not Owned Data</div>
        <Table
          className="list-table"
          rowKey="name"
          dataSource={notOwnedCounts}
          columns={columns}
          rowClassName={getRowClassName}
          bordered
          size="small"
          tableLayout="fixed"
          pagination={false}
        />
      </div>
    </div>
  );
};

export default RelationCountsTable;
