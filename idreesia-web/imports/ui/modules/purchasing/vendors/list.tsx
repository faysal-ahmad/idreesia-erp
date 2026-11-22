import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedPurchasingVendorsQuery } from 'meteor/idreesia-common/types/client-operations';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { default as paths } from '../submodule-paths';
import NewForm, { type NewVendorFormValues } from './new-form';
import {
  CREATE_PURCHASING_VENDOR,
  PAGED_PURCHASING_VENDORS,
  REMOVE_PURCHASING_VENDOR,
  SET_PURCHASING_VENDOR_ACTIVE,
} from './gql';

type VendorRow = NonNullable<
  NonNullable<
    PagedPurchasingVendorsQuery['pagedPurchasingVendors']
  >['data']
>[number] & { _id: string };

const STATUS_OPTIONS = [
  { value: 'all', label: 'All vendors' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const List = ({ history, location }: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Vendors']);

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['search', 'status', 'pageIndex', 'pageSize'],
    paramDefaultValues: { status: 'all' },
  });
  const search = String(queryParams.search ?? '');
  const status = String(queryParams.status ?? 'all');
  const pageIndex = toSafeInteger(queryParams.pageIndex);
  const pageSize = toSafeInteger(queryParams.pageSize) || 20;

  const { containerRef, scrollY } = useListScrollY();
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewVendorFormValues>();

  const { data, loading, refetch } = useQuery(PAGED_PURCHASING_VENDORS, {
    variables: {
      search: search || undefined,
      isActive: status === 'all' ? undefined : status === 'active',
      pageIndex,
      pageSize,
    },
  });
  const refetchQueries = ['pagedPurchasingVendors'];
  const [createVendor, { loading: creating }] = useMutation(
    CREATE_PURCHASING_VENDOR,
    { refetchQueries }
  );
  const [setVendorActive] = useMutation(SET_PURCHASING_VENDOR_ACTIVE, {
    refetchQueries,
  });
  const [removeVendor] = useMutation(REMOVE_PURCHASING_VENDOR, {
    refetchQueries,
  });

  const rows = (data?.pagedPurchasingVendors?.data ?? []).filter(
    (row): row is VendorRow => row?._id != null
  );
  const totalResults = data?.pagedPurchasingVendors?.totalResults ?? 0;

  const reportError = (error: Error) => {
    message.error(error.message, 5);
  };

  const handleNewClicked = () => {
    newForm.resetFields();
    setShowNewFormModal(true);
  };

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreate = () =>
    newForm
      .validateFields()
      .then((values) =>
        createVendor({
          variables: {
            name: values.name,
            contactPerson: values.contactPerson,
            phone: values.phone,
            paymentTermsDays: values.paymentTermsDays ?? undefined,
          },
        })
      )
      .then(() => {
        message.success('Vendor created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        // Form validation errors have no message; mutation errors do.
        if (error?.message) reportError(error);
      });

  const handleToggleActive = (record: VendorRow) => {
    setVendorActive({
      variables: { _id: record._id, isActive: !record.isActive },
    }).catch(reportError);
  };

  const handleDelete = (record: VendorRow) => {
    removeVendor({ variables: { _id: record._id } })
      .then(() => message.success('Vendor deleted', 2))
      .catch(reportError);
  };

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const handlePaginationChange = (page: number, size?: number) => {
    setPageParams({
      pageIndex: page - 1,
      pageSize: size ?? pageSize,
    });
  };

  if (loading && rows.length === 0 && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: VendorRow) => (
        <Space size={8}>
          <Link to={paths.vendorEditPath(record._id)}>{text}</Link>
          {record.isActive ? null : <Tag>Inactive</Tag>}
        </Space>
      ),
    },
    { title: 'Contact Person', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 180 },
    {
      title: 'Payment Terms',
      dataIndex: 'paymentTermsDays',
      key: 'paymentTermsDays',
      width: 160,
      render: (days: number | null | undefined) =>
        days == null ? '' : `${days} days`,
    },
    {
      key: 'action',
      width: 96,
      render: (_text: unknown, record: VendorRow) => (
        <div className="list-actions-column">
          <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
            {record.isActive ? (
              <PauseCircleOutlined
                className="list-actions-icon"
                onClick={() => handleToggleActive(record)}
              />
            ) : (
              <CheckCircleOutlined
                className="list-actions-icon"
                onClick={() => handleToggleActive(record)}
              />
            )}
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this vendor?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="list-container" ref={containerRef}>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={rows}
          columns={columns}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
          title={() => (
            <div className="list-table-header">
              <Space size={12}>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={handleNewClicked}
                >
                  New Vendor
                </Button>
              </Space>
              <div className="list-table-header-utilities">
                <Space size={8}>
                  <Input.Search
                    allowClear
                    placeholder="Search vendors"
                    defaultValue={search}
                    style={{ width: 240 }}
                    onSearch={(value) =>
                      setPageParams({ search: value, pageIndex: 0 })
                    }
                  />
                  <Select
                    value={status}
                    options={STATUS_OPTIONS}
                    style={{ width: 140 }}
                    onChange={(value) =>
                      setPageParams({ status: value, pageIndex: 0 })
                    }
                  />
                  <Button
                    icon={<SyncOutlined />}
                    onClick={handleRefresh}
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
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} vendors`
              }
              onChange={handlePaginationChange}
              onShowSizeChange={handlePaginationChange}
              total={totalResults}
            />
          )}
        />
      </div>

      <Modal
        title="New Vendor"
        open={showNewFormModal}
        width={560}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreate}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <NewForm form={newForm} />
      </Modal>
    </>
  );
};

export default List;
