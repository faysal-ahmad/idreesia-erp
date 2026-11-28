import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Empty, Space, Table } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { formatDate, formatMoney } from '../common/format';
import VendorSelect from '../common/vendor-select';
import { default as paths } from '../submodule-paths';
import { PURCHASING_VENDOR_LEDGER } from './gql';
import { DateRange, ExportButton, type Range, rangeArgs, rangeVariables } from './report-table';

const VendorLedger = (_props: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Reports', 'Vendor Ledger']);
  const [vendorId, setVendorId] = useState<string | undefined>();
  const [range, setRange] = useState<Range>([null, null]);
  const { data } = useQuery(PURCHASING_VENDOR_LEDGER, {
    variables: { vendorId: vendorId ?? '', ...rangeVariables(range) },
    skip: !vendorId,
    fetchPolicy: 'cache-and-network',
  });
  const ledger = data?.purchasingVendorLedger;
  const { containerRef, scrollY } = useListScrollY();

  return (
    <div className="list-container" ref={containerRef}>
      <Space style={{ marginBottom: 12 }} wrap>
        <VendorSelect includeInactive value={vendorId} onChange={setVendorId} />
        <DateRange value={range} onChange={setRange} />
        {vendorId ? (
          <ExportButton reportName="PurchasingVendorLedger" reportArgs={`${vendorId},${rangeArgs(range)}`} />
        ) : null}
      </Space>
      {!vendorId ? (
        <Empty description="Choose a vendor" />
      ) : (
        <Table
          className="list-table"
          rowKey={(row: any) => `${row.type}-${row.documentId}`}
          size="middle"
          bordered
          pagination={false}
          scroll={{ y: scrollY }}
          dataSource={(ledger?.entries ?? []).filter((e) => e != null) as any[]}
          columns={[
            { title: 'Date', dataIndex: 'date', width: 130, render: formatDate },
            {
              title: 'Document',
              key: 'document',
              render: (_: unknown, e: any) => (
                <Link to={e.type === 'invoice' ? paths.invoiceViewPath(e.documentId) : paths.paymentViewPath(e.documentId)}>
                  {e.number}
                </Link>
              ),
            },
            { title: 'Reference', dataIndex: 'reference' },
            {
              title: 'Billed',
              key: 'billed',
              width: 150,
              align: 'right',
              render: (_: unknown, e: any) => (e.amount > 0 ? formatMoney(e.amount) : ''),
            },
            {
              title: 'Paid',
              key: 'paid',
              width: 150,
              align: 'right',
              render: (_: unknown, e: any) => (e.amount < 0 ? formatMoney(-e.amount) : ''),
            },
            { title: 'Balance', dataIndex: 'balance', width: 150, align: 'right', render: formatMoney },
          ]}
          title={() => <strong>Opening balance: {formatMoney(ledger?.openingBalance ?? 0)}</strong>}
          footer={() => <strong>Closing balance: {formatMoney(ledger?.closingBalance ?? 0)}</strong>}
        />
      )}
    </div>
  );
};

export default VendorLedger;
