import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CheckCircleOutlined,
  PictureOutlined,
  DeleteOutlined,
  PauseCircleOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Avatar,
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
import type { PagedPurchasingCatalogItemsQuery } from 'meteor/idreesia-common/types/client-operations';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { default as paths } from '../submodule-paths';
import NewForm, { type NewCatalogItemFormValues } from './new-form';
import {
  CREATE_PURCHASING_CATALOG_ITEM,
  PAGED_PURCHASING_CATALOG_ITEMS,
  REMOVE_PURCHASING_CATALOG_ITEM,
  SET_PURCHASING_CATALOG_ITEM_ACTIVE,
} from './gql';

type ItemRow = NonNullable<
  NonNullable<
    PagedPurchasingCatalogItemsQuery['pagedPurchasingCatalogItems']
  >['data']
>[number] & { _id: string };

const STATUS_OPTIONS = [
  { value: 'all', label: 'All items' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const formatPrice = (price: number | null | undefined) =>
  price == null ? '' : price.toLocaleString(undefined, { minimumFractionDigits: 2 });

const List = ({ history, location }: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Catalog']);

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
  const [newForm] = Form.useForm<NewCatalogItemFormValues>();

  const { data, loading, refetch } = useQuery(PAGED_PURCHASING_CATALOG_ITEMS, {
    variables: {
      search: search || undefined,
      isActive: status === 'all' ? undefined : status === 'active',
      pageIndex,
      pageSize,
    },
    fetchPolicy: 'cache-and-network',
  });
  const refetchQueries = ['pagedPurchasingCatalogItems'];
  const [createItem, { loading: creating }] = useMutation(
    CREATE_PURCHASING_CATALOG_ITEM,
    { refetchQueries }
  );
  const [setItemActive] = useMutation(SET_PURCHASING_CATALOG_ITEM_ACTIVE, {
    refetchQueries,
  });
  const [removeItem] = useMutation(REMOVE_PURCHASING_CATALOG_ITEM, {
    refetchQueries,
  });

  const rows = (data?.pagedPurchasingCatalogItems?.data ?? []).filter(
    (row): row is ItemRow => row?._id != null
  );
  const totalResults = data?.pagedPurchasingCatalogItems?.totalResults ?? 0;

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
        createItem({
          variables: {
            name: values.name,
            unit: values.unit,
            category: values.category,
            company: values.company,
            defaultUnitPrice: values.defaultUnitPrice ?? undefined,
          },
        })
      )
      .then(() => {
        message.success('Catalog item created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) reportError(error);
      });

  const handleToggleActive = (record: ItemRow) => {
    setItemActive({
      variables: { _id: record._id, isActive: !record.isActive },
    }).catch(reportError);
  };

  const handleDelete = (record: ItemRow) => {
    removeItem({ variables: { _id: record._id } })
      .then(() => message.success('Catalog item deleted', 2))
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

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns: any[] = [
    {
      title: '',
      key: 'image',
      width: 64,
      render: (_text: unknown, record: ItemRow) => (
        <Avatar
          shape="square"
          size={40}
          src={record.imageUrl ?? undefined}
          icon={<PictureOutlined />}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ItemRow) => (
        <Space size={8}>
          <Link to={paths.catalogItemEditPath(record._id)}>{text}</Link>
          {record.isActive ? null : <Tag>Inactive</Tag>}
        </Space>
      ),
    },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 120 },
    { title: 'Company', dataIndex: 'company', key: 'company', width: 200 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 200 },
    {
      title: 'Default Price',
      dataIndex: 'defaultUnitPrice',
      key: 'defaultUnitPrice',
      width: 150,
      align: 'right',
      render: formatPrice,
    },
    {
      title: 'Last Price',
      dataIndex: 'lastUnitPrice',
      key: 'lastUnitPrice',
      width: 150,
      align: 'right',
      render: formatPrice,
    },
    {
      key: 'action',
      width: 96,
      render: (_text: unknown, record: ItemRow) => (
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
            title="Are you sure you want to delete this item?"
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
                  New Item
                </Button>
              </Space>
              <div className="list-table-header-utilities">
                <Space size={8}>
                  <Input.Search
                    allowClear
                    placeholder="Search items"
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
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={handlePaginationChange}
              onShowSizeChange={handlePaginationChange}
              total={totalResults}
            />
          )}
        />
      </div>

      <Modal
        title="New Catalog Item"
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
