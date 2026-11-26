import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Pagination, Popconfirm, Select, Space, Spin, Table, Tag } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputNumberField,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { formatMoney } from '../../common/format';
import { runAction } from '../../common/run-action';
import usePurchasingAccess from '../../common/use-purchasing-access';
import CustodianInput from './custodian-input';
import {
  CREATE_PURCHASING_PETTY_CASH_FUND,
  PAGED_PURCHASING_PETTY_CASH_FUNDS,
  SET_PURCHASING_PETTY_CASH_FUND_ACTIVE,
  UPDATE_PURCHASING_PETTY_CASH_FUND,
} from '../gql';

interface FundFormValues {
  name: string;
  custodian?: { _id?: string } | null;
  floatAmount?: number | null;
  perTransactionLimit?: number | null;
  notes?: string;
}

const ACTIVE_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all', label: 'All' },
];

const FundsList = ({ history, location }: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Setup', 'Petty Cash Funds']);
  const { can } = usePurchasingAccess();
  const canManage = can(Permissions.PURCHASING_MANAGE_PETTY_CASH_FUNDS);

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['active', 'pageIndex', 'pageSize'],
    paramDefaultValues: { active: 'active' },
  });
  const active = String(queryParams.active ?? 'active');
  const pageIndex = toSafeInteger(queryParams.pageIndex);
  const pageSize = toSafeInteger(queryParams.pageSize) || 20;
  const { containerRef, scrollY } = useListScrollY();

  const { data, loading, refetch } = useQuery(PAGED_PURCHASING_PETTY_CASH_FUNDS, {
    variables: {
      isActive: active === 'all' ? undefined : active === 'active',
      pageIndex,
      pageSize,
    },
    fetchPolicy: 'cache-and-network',
  });
  const rows = (data?.pagedPurchasingPettyCashFunds?.data ?? []).filter((row) => row?._id != null);
  const totalResults = data?.pagedPurchasingPettyCashFunds?.totalResults ?? 0;

  const refetchQueries = ['pagedPurchasingPettyCashFunds'];
  const [createFund] = useMutation(CREATE_PURCHASING_PETTY_CASH_FUND, { refetchQueries });
  const [updateFund] = useMutation(UPDATE_PURCHASING_PETTY_CASH_FUND, { refetchQueries });
  const [setActive] = useMutation(SET_PURCHASING_PETTY_CASH_FUND_ACTIVE, { refetchQueries });

  // `undefined` is closed, `null` is a new fund, a row is an edit.
  const [editing, setEditing] = useState<(typeof rows)[number] | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<FundFormValues>();

  const handleSave = async () => {
    const values = await form.validateFields();
    const variables = {
      name: values.name,
      custodianPersonId: values.custodian?._id ?? '',
      floatAmount: values.floatAmount ?? 0,
      perTransactionLimit: values.perTransactionLimit ?? undefined,
      notes: values.notes,
    };
    setSaving(true);
    const ok = await runAction(
      editing?._id
        ? updateFund({ variables: { _id: editing._id, ...variables } })
        : createFund({ variables }),
      editing?._id ? 'Fund updated' : 'Fund created'
    );
    setSaving(false);
    if (ok) {
      setEditing(undefined);
      form.resetFields();
    }
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Custodian',
      key: 'custodian',
      width: 200,
      render: (_: unknown, row: any) => row.custodian?.sharedData?.name ?? '',
    },
    { title: 'Float', dataIndex: 'floatAmount', key: 'floatAmount', width: 120, align: 'right' as const, render: formatMoney },
    { title: 'Balance', dataIndex: 'balance', key: 'balance', width: 120, align: 'right' as const, render: formatMoney },
    {
      title: 'Limit per Voucher',
      dataIndex: 'perTransactionLimit',
      key: 'perTransactionLimit',
      width: 140,
      align: 'right' as const,
      render: (value: number | null) => (value == null ? 'None' : formatMoney(value)),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
    },
    ...(canManage
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: 170,
            render: (_: unknown, row: any) => (
              <Space size={4}>
                <Button size="small" onClick={() => setEditing(row)}>Edit</Button>
                <Popconfirm
                  title={row.isActive ? 'Deactivate this fund?' : 'Activate this fund?'}
                  onConfirm={() =>
                    runAction(setActive({ variables: { _id: row._id, isActive: !row.isActive } }), 'Fund updated')
                  }
                >
                  <Button size="small">{row.isActive ? 'Deactivate' : 'Activate'}</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={rows as any[]}
        columns={columns}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        title={() => (
          <div className="list-table-header">
            <Space size={12}>
              {canManage ? (
                <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => setEditing(null)}>
                  New Fund
                </Button>
              ) : null}
            </Space>
            <div className="list-table-header-utilities">
              <Space size={8}>
                <Select
                  value={active}
                  options={ACTIVE_OPTIONS}
                  style={{ width: 120 }}
                  onChange={(value) => setPageParams({ active: value, pageIndex: 0 })}
                />
                <Button
                  icon={<SyncOutlined />}
                  title="Reload Data"
                  onClick={() => refetch().then(() => message.success('Data Reloaded', 2))}
                />
              </Space>
            </div>
          </div>
        )}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} funds`}
            onChange={(page, size) => setPageParams({ pageIndex: page - 1, pageSize: size ?? pageSize })}
            total={totalResults}
          />
        )}
      />
      <Modal
        title={editing?._id ? 'Edit Petty Cash Fund' : 'New Petty Cash Fund'}
        open={editing !== undefined}
        okText="Save"
        confirmLoading={saving}
        onOk={handleSave}
        onCancel={() => {
          setEditing(undefined);
          form.resetFields();
        }}
        destroyOnHidden
        width={640}
      >
        <Form key={editing?._id ?? 'new'} form={form} layout="horizontal" style={{ width: '100%' }}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={editing?.name}
            required
            requiredMessage="Please enter a name."
          />
          <Form.Item
            name="custodian"
            label="Custodian"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            initialValue={
              editing?.custodian?._id
                ? { _id: editing.custodian._id, name: editing.custodian.sharedData?.name }
                : null
            }
            rules={[{ required: true, message: 'Please choose who holds the cash.' }]}
          >
            <CustodianInput />
          </Form.Item>
          <InputNumberField
            fieldName="floatAmount"
            fieldLabel="Float"
            initialValue={editing?.floatAmount}
            minValue={0}
            precision={2}
            required
            requiredMessage="Please enter the float."
          />
          <InputNumberField
            fieldName="perTransactionLimit"
            fieldLabel="Limit per Voucher"
            initialValue={editing?.perTransactionLimit}
            minValue={0}
            precision={2}
          />
          <InputTextAreaField fieldName="notes" fieldLabel="Notes" initialValue={editing?.notes} />
        </Form>
      </Modal>
    </div>
  );
};

export default FundsList;
