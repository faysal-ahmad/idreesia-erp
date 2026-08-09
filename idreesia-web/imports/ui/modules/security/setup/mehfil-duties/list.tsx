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
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { SetupAllSecurityMehfilDutiesQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import NewForm, { type NewMehfilDutyFormValues } from './new-form';
import {
  SETUP_ALL_SECURITY_MEHFIL_DUTIES,
  CREATE_SECURITY_MEHFIL_DUTY,
  REMOVE_SECURITY_MEHFIL_DUTY,
} from './gql';

const RouterLink = Link as any;

const DEFAULT_PAGE_SIZE = 20;

type MehfilDutyRow = NonNullable<
  NonNullable<SetupAllSecurityMehfilDutiesQuery['allSecurityMehfilDuties']>[number]
>;

const List = () => {
  useBreadcrumbs(['Security', 'Mehfil Duties']);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewMehfilDutyFormValues>();

  const { data, loading, refetch } = useQuery(SETUP_ALL_SECURITY_MEHFIL_DUTIES);
  const allSecurityMehfilDuties = (data?.allSecurityMehfilDuties ?? []).filter(
    (row): row is MehfilDutyRow => row != null && row._id != null
  );

  const [createSecurityMehfilDuty, { loading: creating }] = useMutation(
    CREATE_SECURITY_MEHFIL_DUTY,
    {
      refetchQueries: ['setupAllSecurityMehfilDuties'],
    }
  );
  const [removeSecurityMehfilDuty] = useMutation(REMOVE_SECURITY_MEHFIL_DUTY, {
    refetchQueries: ['setupAllSecurityMehfilDuties'],
  });

  const handleNewClicked = () => {
    newForm.resetFields();
    setShowNewFormModal(true);
  };

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreateDuty = () =>
    newForm
      .validateFields()
      .then((values) =>
        createSecurityMehfilDuty({
          variables: {
            name: values.name,
            urduName: values.urduName,
          },
        })
      )
      .then(() => {
        message.success('Mehfil duty created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        // Ignore form validation errors; show mutation errors.
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (record: MehfilDutyRow) => {
    removeSecurityMehfilDuty({
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

  const totalResults = allSecurityMehfilDuties.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allSecurityMehfilDuties.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MehfilDutyRow) => (
        <RouterLink to={`${paths.mehfilDutiesPath}/${record._id}`}>
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
      render: (_text: unknown, record: MehfilDutyRow) => {
        if (record.overallUsedCount !== 0) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this mehfil duty?"
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
              New Mehfil Duty
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
          size="medium"
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
        title="New Mehfil Duty"
        open={showNewFormModal}
        width={560}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateDuty}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <NewForm form={newForm} />
      </Modal>
    </>
  );
};

export default List;
