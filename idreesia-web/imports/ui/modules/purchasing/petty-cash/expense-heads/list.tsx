import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { EditOutlined, PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Pagination, Popconfirm, Select, Space, Spin, Table, Tag, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { InputTextAreaField, InputTextField } from '/imports/ui/modules/helpers/fields';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { runAction } from '../../common/run-action';
import usePurchasingAccess from '../../common/use-purchasing-access';
import {
  CREATE_PURCHASING_PETTY_CASH_EXPENSE_HEAD,
  DELETE_PURCHASING_PETTY_CASH_EXPENSE_HEAD,
  PAGED_PURCHASING_PETTY_CASH_EXPENSE_HEADS,
  SET_PURCHASING_PETTY_CASH_EXPENSE_HEAD_ACTIVE,
  UPDATE_PURCHASING_PETTY_CASH_EXPENSE_HEAD,
} from '../gql';

interface HeadFormValues {
  name: string;
  description?: string;
}

const ACTIVE_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all', label: 'All' },
];

const ExpenseHeadsList = ({ history, location }: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Setup', 'Petty Cash Expense Heads']);
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

  const { data, loading, refetch } = useQuery(PAGED_PURCHASING_PETTY_CASH_EXPENSE_HEADS, {
    variables: {
      isActive: active === 'all' ? undefined : active === 'active',
      pageIndex,
      pageSize,
    },
    fetchPolicy: 'cache-and-network',
  });
  const rows = (data?.pagedPurchasingPettyCashExpenseHeads?.data ?? []).filter((row) => row?._id != null);
  const totalResults = data?.pagedPurchasingPettyCashExpenseHeads?.totalResults ?? 0;

  const refetchQueries = ['pagedPurchasingPettyCashExpenseHeads'];
  const [createHead] = useMutation(CREATE_PURCHASING_PETTY_CASH_EXPENSE_HEAD, { refetchQueries });
  const [updateHead] = useMutation(UPDATE_PURCHASING_PETTY_CASH_EXPENSE_HEAD, { refetchQueries });
  const [setActive] = useMutation(SET_PURCHASING_PETTY_CASH_EXPENSE_HEAD_ACTIVE, { refetchQueries });
  const [deleteHead] = useMutation(DELETE_PURCHASING_PETTY_CASH_EXPENSE_HEAD, { refetchQueries });

  // `undefined` is closed, `null` is a new head, a row is an edit.
  const [editing, setEditing] = useState<(typeof rows)[number] | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<HeadFormValues>();

  const handleSave = async () => {
    const values = await form.validateFields();
    const variables = { name: values.name, description: values.description || undefined };
    setSaving(true);
    const ok = await runAction(
      editing?._id
        ? updateHead({ variables: { _id: editing._id, ...variables } })
        : createHead({ variables }),
      editing?._id ? 'Expense head updated' : 'Expense head created'
    );
    setSaving(false);
    if (ok) {
      setEditing(undefined);
      form.resetFields();
    }
  };

  const closeDialog = () => {
    setEditing(undefined);
    form.resetFields();
  };

  const handleToggleActive = async () => {
    if (!editing?._id) return;
    const ok = await runAction(
      setActive({ variables: { _id: editing._id, isActive: !editing.isActive } }),
      'Expense head updated'
    );
    if (ok) closeDialog();
  };

  const handleDelete = async () => {
    if (!editing?._id) return;
    const ok = await runAction(deleteHead({ variables: { _id: editing._id } }), 'Expense head deleted');
    if (ok) closeDialog();
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 260 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
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
            title: '',
            key: 'actions',
            width: 60,
            align: 'center' as const,
            render: (_: unknown, row: any) => (
              <Tooltip title="Edit">
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setEditing(row)} />
              </Tooltip>
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
                  New Expense Head
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
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} expense heads`}
            onChange={(page, size) => setPageParams({ pageIndex: page - 1, pageSize: size ?? pageSize })}
            total={totalResults}
          />
        )}
      />
      <Modal
        title={editing?._id ? 'Edit Expense Head' : 'New Expense Head'}
        open={editing !== undefined}
        onCancel={closeDialog}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              {editing?._id ? (
                <Popconfirm
                  title={editing.isActive ? 'Deactivate this expense head?' : 'Activate this expense head?'}
                  onConfirm={handleToggleActive}
                >
                  <Button>{editing.isActive ? 'Deactivate' : 'Activate'}</Button>
                </Popconfirm>
              ) : null}
              {editing?._id && !editing.inUse ? (
                <Popconfirm title="Delete this expense head?" onConfirm={handleDelete}>
                  <Button danger>Delete</Button>
                </Popconfirm>
              ) : null}
            </Space>
            <Space>
              <Button onClick={closeDialog}>Cancel</Button>
              <Button type="primary" loading={saving} onClick={handleSave}>Save</Button>
            </Space>
          </div>
        }
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
          <InputTextAreaField fieldName="description" fieldLabel="Description" initialValue={editing?.description} />
        </Form>
      </Modal>
    </div>
  );
};

export default ExpenseHeadsList;
