import React, { useEffect, useMemo, useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Empty, Space, Table } from 'antd';
import dayjs from 'dayjs';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { formatMoney } from '../../common/format';
import RecordSelect from '../../common/record-select';
import { DateRange, type Range, rangeVariables } from '../../reports/report-table';
import {
  PAGED_PURCHASING_PETTY_CASH_EXPENSE_HEADS,
  PAGED_PURCHASING_PETTY_CASH_FUNDS,
  PURCHASING_PETTY_CASH_LEDGER,
} from '../gql';

interface Row {
  key: string;
  label: string;
  debit?: number | null;
  credit?: number | null;
  balance?: number | null;
  // Only the vouchers row is split by head.
  byHead?: boolean;
}

// A total; a dash when nothing was booked, as in the paper ledger.
const total = (value: number | null | undefined) => (value ? formatMoney(value) : '-');
const balance = (value: number | null | undefined) =>
  value != null && value < 0 ? (
    <span className="petty-cash-ledger-negative">({formatMoney(-value)})</span>
  ) : (
    formatMoney(value)
  );

const thisYear = (): Range => [dayjs().startOf('year'), dayjs().endOf('year')];

/**
 * A fund's cash book for a period, laid out like the paper petty cash
 * register: the opening balance, the replenishments received (Dr), the
 * vouchers spent (Cr, also split by expense head) and the running balance,
 * with the head-wise totals at the bottom.
 */
const PettyCashLedger = (_props: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Petty Cash', 'Petty Cash Ledger']);
  const [fundId, setFundId] = useState<string | undefined>();
  const [range, setRange] = useState<Range>(thisYear);
  const { containerRef, scrollY } = useListScrollY();

  // Open on the first active fund so the page is useful straight away.
  const { data: funds } = useQuery(PAGED_PURCHASING_PETTY_CASH_FUNDS, {
    variables: { isActive: true, pageIndex: 0, pageSize: 1 },
    skip: !!fundId,
  });
  const firstFundId = funds?.pagedPurchasingPettyCashFunds?.data?.[0]?._id;
  useEffect(() => {
    if (!fundId && firstFundId) setFundId(firstFundId);
  }, [fundId, firstFundId]);

  const { data, loading, refetch } = useQuery(PURCHASING_PETTY_CASH_LEDGER, {
    variables: { fundId: fundId ?? '', ...rangeVariables(range) },
    skip: !fundId,
    fetchPolicy: 'cache-and-network',
  });
  const ledger = data?.purchasingPettyCashLedger;
  // Until a fund's ledger is loaded, the active heads give the columns, so
  // the layout shows even before a fund is chosen.
  const { data: activeHeads } = useQuery(PAGED_PURCHASING_PETTY_CASH_EXPENSE_HEADS, {
    variables: { isActive: true, pageIndex: 0, pageSize: 200 },
    skip: !!ledger,
  });
  const heads = useMemo(
    () =>
      (
        ledger?.heads ??
        activeHeads?.pagedPurchasingPettyCashExpenseHeads?.data?.map((h) => h && { ...h, total: 0 }) ??
        []
      ).filter((h) => h != null),
    [ledger, activeHeads]
  );

  const rows = useMemo<Row[]>(() => {
    if (!ledger) return [];
    const opening = ledger.openingBalance ?? 0;
    const replenished = ledger.replenishmentTotal ?? 0;
    return [
      { key: 'opening', label: 'Opening balance', balance: opening },
      { key: 'replenishments', label: 'Replenishments', debit: replenished, balance: Math.round((opening + replenished) * 100) / 100 },
      { key: 'vouchers', label: 'Vouchers', credit: ledger.voucherTotal, balance: ledger.closingBalance, byHead: true },
    ];
  }, [ledger]);

  const columns = [
    { title: '', dataIndex: 'label', width: 180, render: (text: string) => <strong>{text}</strong> },
    { title: 'Dr', dataIndex: 'debit', width: 130, align: 'right' as const, render: (v: number | null) => (v == null ? '' : total(v)) },
    { title: 'Cr', dataIndex: 'credit', width: 130, align: 'right' as const, render: (v: number | null) => (v == null ? '' : total(v)) },
    { title: 'Balance', dataIndex: 'balance', width: 140, align: 'right' as const, render: balance },
    ...heads.map((head) => ({
      title: head.name,
      key: `head-${head._id}`,
      width: 120,
      align: 'right' as const,
      className: 'petty-cash-ledger-head',
      render: (_: unknown, row: Row) => (row.byHead ? total(head.total) : ''),
    })),
  ];

  const toolbar = () => (
    <div className="list-table-header">
      <Space size={12} wrap>
        <RecordSelect
          value={fundId}
          onChange={setFundId}
          query={PAGED_PURCHASING_PETTY_CASH_FUNDS}
          dataKey="pagedPurchasingPettyCashFunds"
          labelOf={(f) => f.name ?? ''}
          placeholder="Choose a fund"
          allowClear={false}
        />
        <DateRange value={range} onChange={setRange} />
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Button icon={<SyncOutlined />} onClick={() => fundId && refetch()} title="Reload Data" />
        </Space>
      </div>
    </div>
  );

  const summary = () => (
    <Table.Summary fixed="bottom">
      <Table.Summary.Row className="petty-cash-ledger-totals">
        <Table.Summary.Cell index={0}>
          <strong>Head Wise Total</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={1} align="right">
          <strong>{total(ledger?.replenishmentTotal)}</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={2} align="right">
          <strong>{total(ledger?.voucherTotal)}</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={3} align="right">
          <strong>{balance(ledger?.closingBalance ?? 0)}</strong>
        </Table.Summary.Cell>
        {heads.map((head, i) => (
          <Table.Summary.Cell key={head._id ?? i} index={4 + i} align="right">
            <strong>{total(head.total)}</strong>
          </Table.Summary.Cell>
        ))}
      </Table.Summary.Row>
    </Table.Summary>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table<Row>
        className="list-table petty-cash-ledger"
        rowKey="key"
        size="middle"
        bordered
        tableLayout="fixed"
        pagination={false}
        title={toolbar}
        dataSource={fundId ? rows : []}
        columns={columns}
        loading={!!fundId && loading && !ledger}
        locale={{ emptyText: <Empty description={firstFundId === undefined && funds ? 'No active petty cash fund yet' : 'Choose a fund'} /> }}
        summary={fundId && ledger ? summary : undefined}
        scroll={{ x: 'max-content', y: scrollY }}
      />
    </div>
  );
};

export default PettyCashLedger;
