import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, Input, InputNumber, Modal, Table } from 'antd';

import { Permissions } from 'meteor/idreesia-common/constants';

import DocumentList from '../../common/document-list';
import { formatDate, formatMoney } from '../../common/format';
import RecordSelect from '../../common/record-select';
import StatusTag from '../../common/status-tag';
import usePurchasingAccess from '../../common/use-purchasing-access';
import { default as paths } from '../../submodule-paths';
import {
  PAGED_PURCHASING_PETTY_CASH_FUNDS,
  PAGED_PURCHASING_PETTY_CASH_REPLENISHMENTS,
  PAGED_PURCHASING_PETTY_CASH_VOUCHERS,
  REQUEST_PURCHASING_PETTY_CASH_REPLENISHMENT,
} from '../gql';

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  onRequested: (id: string) => void;
}

/** Asks finance to top a fund back up for the vouchers it has already paid. */
const RequestModal = ({ open, onClose, onRequested }: RequestModalProps) => {
  const [fundId, setFundId] = useState<string | undefined>();
  const [selected, setSelected] = useState<string[] | undefined>();
  const [countedCash, setCountedCash] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, loading } = useQuery(PAGED_PURCHASING_PETTY_CASH_VOUCHERS, {
    variables: { fundId, unreplenishedOnly: true, pageIndex: 0, pageSize: 200 },
    skip: !fundId,
    fetchPolicy: 'network-only',
  });
  const vouchers = (data?.pagedPurchasingPettyCashVouchers?.data ?? []).filter(
    (v): v is NonNullable<typeof v> => v?._id != null
  );
  // Until the user changes it, every voucher is bundled.
  const chosen = selected ?? vouchers.map((v) => v._id as string);
  const amount = vouchers.filter((v) => chosen.includes(v._id as string)).reduce((sum, v) => sum + (v.total ?? 0), 0);

  const [request, { loading: saving }] = useMutation(REQUEST_PURCHASING_PETTY_CASH_REPLENISHMENT, {
    refetchQueries: ['pagedPurchasingPettyCashReplenishments', 'pagedPurchasingPettyCashVouchers'],
  });

  const reset = () => {
    setFundId(undefined);
    setSelected(undefined);
    setCountedCash(null);
    setNotes('');
    setError(null);
  };

  const handleOk = async () => {
    setError(null);
    try {
      const result = await request({
        variables: { fundId: fundId!, voucherIds: chosen, countedCash: countedCash ?? undefined, notes: notes || undefined },
      });
      const id = result.data?.requestPurchasingPettyCashReplenishment?._id;
      reset();
      if (id) onRequested(id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Modal
      title="Request Replenishment"
      open={open}
      okText="Request"
      okButtonProps={{ disabled: !fundId || chosen.length === 0 }}
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={() => {
        reset();
        onClose();
      }}
      destroyOnHidden
      width={760}
    >
      <Form layout="vertical">
        <Form.Item label="Fund">
          <RecordSelect
            value={fundId}
            onChange={(value) => {
              setFundId(value);
              setSelected(undefined);
            }}
            query={PAGED_PURCHASING_PETTY_CASH_FUNDS}
            dataKey="pagedPurchasingPettyCashFunds"
            labelOf={(f) => f.name ?? ''}
            placeholder="Choose the fund to top up"
          />
        </Form.Item>
        {fundId ? (
          <Form.Item label={`Approved vouchers to bundle (${formatMoney(amount)})`}>
            <Table
              rowKey="_id"
              size="small"
              bordered
              loading={loading}
              pagination={false}
              scroll={{ y: 240 }}
              dataSource={vouchers as any[]}
              locale={{ emptyText: 'No approved vouchers are waiting for a replenishment.' }}
              rowSelection={{ selectedRowKeys: chosen, onChange: (keys) => setSelected(keys as string[]) }}
              columns={[
                { title: 'Number', dataIndex: 'number', width: 140 },
                { title: 'Date', dataIndex: 'voucherDate', width: 110, render: formatDate },
                { title: 'Paid To', dataIndex: 'payee' },
                { title: 'Total', dataIndex: 'total', width: 110, align: 'right', render: formatMoney },
              ]}
            />
          </Form.Item>
        ) : null}
        <Form.Item label="Cash counted in the fund (optional)">
          <InputNumber min={0} precision={2} value={countedCash} onChange={setCountedCash} style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="Notes" validateStatus={error ? 'error' : undefined} help={error ?? undefined}>
          <Input.TextArea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const List = (props: RouteComponentProps) => {
  const { can } = usePurchasingAccess();
  const [requesting, setRequesting] = useState(false);

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      render: (text: string, record: { _id: string }) => (
        <Link to={paths.pettyCashReplenishmentViewPath(record._id)}>{text}</Link>
      ),
    },
    { title: 'Requested', dataIndex: 'createdAt', key: 'createdAt', width: 120, render: formatDate },
    { title: 'Fund', key: 'fund', render: (_: unknown, record: any) => record.fund?.name ?? '' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 130, align: 'right' as const, render: formatMoney },
    { title: 'Cash Variance', dataIndex: 'variance', key: 'variance', width: 140, align: 'right' as const, render: formatMoney },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => <StatusTag status={status} />,
    },
  ];

  return (
    <>
      <DocumentList
        {...props}
        breadcrumbs={['Purchasing', 'Petty Cash Replenishments']}
        query={PAGED_PURCHASING_PETTY_CASH_REPLENISHMENTS}
        dataKey="pagedPurchasingPettyCashReplenishments"
        columns={columns}
        noun="replenishments"
        searchPlaceholder="Search number"
        statuses={['submitted', 'approved', 'rejected']}
        newButton={
          can(Permissions.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS)
            ? { label: 'Request Replenishment', onClick: () => setRequesting(true) }
            : undefined
        }
      />
      <RequestModal
        open={requesting}
        onClose={() => setRequesting(false)}
        onRequested={(id) => {
          setRequesting(false);
          props.history.push(paths.pettyCashReplenishmentViewPath(id));
        }}
      />
    </>
  );
};

export default List;
