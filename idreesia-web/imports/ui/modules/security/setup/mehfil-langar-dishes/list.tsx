import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  Modal,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tooltip,
  message,
} from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllSecurityMehfilLangarDishesQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import NewForm, { type NewLangarDishFormValues } from './new-form';
import {
  ALL_SECURITY_MEHFIL_LANGAR_DISHES,
  CREATE_SECURITY_MEHFIL_LANGAR_DISH,
  REMOVE_SECURITY_MEHFIL_LANGAR_DISH,
} from './gql';

const RouterLink = Link as any;

const DEFAULT_PAGE_SIZE = 20;

type LangarDishRow = NonNullable<
  NonNullable<AllSecurityMehfilLangarDishesQuery['allSecurityMehfilLangarDishes']>[number]
>;

const List = () => {
  useBreadcrumbs(['Security', 'Langar Dishes']);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewLangarDishFormValues>();

  const { data, loading, refetch } = useQuery(ALL_SECURITY_MEHFIL_LANGAR_DISHES);
  const allSecurityMehfilLangarDishes = (
    data?.allSecurityMehfilLangarDishes ?? []
  ).filter((row): row is LangarDishRow => row != null && row._id != null);

  const [createSecurityMehfilLangarDish, { loading: creating }] = useMutation(
    CREATE_SECURITY_MEHFIL_LANGAR_DISH,
    {
      refetchQueries: ['allSecurityMehfilLangarDishes'],
    }
  );
  const [removeSecurityMehfilLangarDish] = useMutation(
    REMOVE_SECURITY_MEHFIL_LANGAR_DISH,
    {
      refetchQueries: ['allSecurityMehfilLangarDishes'],
    }
  );

  const handleNewClicked = () => {
    newForm.resetFields();
    setShowNewFormModal(true);
  };

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreateDish = () =>
    newForm
      .validateFields()
      .then((values) =>
        createSecurityMehfilLangarDish({
          variables: {
            name: values.name,
            urduName: values.urduName,
          },
        })
      )
      .then(() => {
        message.success('Langar dish created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (record: LangarDishRow) => {
    removeSecurityMehfilLangarDish({
      variables: {
        _id: record._id!,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const onPaginationChange = (page: number, nextPageSize?: number) => {
    setPageIndex(page - 1);
    if (nextPageSize != null) setPageSize(nextPageSize);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalResults = allSecurityMehfilLangarDishes.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allSecurityMehfilLangarDishes.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LangarDishRow) => (
        <RouterLink to={`${paths.mehfilLangarDishesPath}/${record._id}`}>
          {text}
        </RouterLink>
      ),
    },
    {
      title: 'Urdu Name',
      dataIndex: 'urduName',
      key: 'urduName',
    },
    {
      key: 'action',
      width: 72,
      render: (_text: unknown, record: LangarDishRow) => {
        if (record.overallUsedCount !== 0) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this langar dish?"
              onConfirm={() => {
                handleDeleteClicked(record);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <DeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="list-container">
        <div className="list-table-header" style={{ marginBottom: 12 }}>
          <Space size={12}>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleNewClicked}
            >
              New Langar Dish
            </Button>
          </Space>
          <div className="list-table-header-utilities">
            <Space size={8}>
              <Button
                icon={<SyncOutlined />}
                onClick={handleRefresh}
                title="Reload Data"
              />
            </Space>
          </div>
        </div>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={pageData}
          columns={columns}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          footer={() => (
            <Pagination
              current={safePageIndex + 1}
              pageSize={pageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={onPaginationChange}
              onShowSizeChange={onPaginationChange}
              total={totalResults}
            />
          )}
        />
      </div>

      <Modal
        title="New Langar Dish"
        open={showNewFormModal}
        width={560}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateDish}
        onCancel={handleCloseNewForm}
        destroyOnClose
      >
        <NewForm form={newForm} />
      </Modal>
    </>
  );
};

export default List;
