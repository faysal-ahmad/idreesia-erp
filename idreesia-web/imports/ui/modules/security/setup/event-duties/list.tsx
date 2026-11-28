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
import type { SetupAllSecurityEventDutiesQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import NewForm, { type NewEventDutyFormValues } from './new-form';
import {
  SETUP_ALL_SECURITY_EVENT_DUTIES,
  CREATE_SECURITY_EVENT_DUTY,
  REMOVE_SECURITY_EVENT_DUTY,
} from './gql';

const DEFAULT_PAGE_SIZE = 20;

type EventDutyRow = NonNullable<
  NonNullable<SetupAllSecurityEventDutiesQuery['allSecurityEventDuties']>[number]
>;

const List = () => {
  useBreadcrumbs(['Security', 'Event Duties']);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewEventDutyFormValues>();

  const { data, loading, refetch } = useQuery(SETUP_ALL_SECURITY_EVENT_DUTIES);
  const allSecurityEventDuties = (data?.allSecurityEventDuties ?? []).filter(
    (row): row is EventDutyRow => row != null && row._id != null
  );

  const [createSecurityEventDuty, { loading: creating }] = useMutation(
    CREATE_SECURITY_EVENT_DUTY,
    {
      refetchQueries: ['setupAllSecurityEventDuties'],
    }
  );
  const [removeSecurityEventDuty] = useMutation(REMOVE_SECURITY_EVENT_DUTY, {
    refetchQueries: ['setupAllSecurityEventDuties'],
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
        createSecurityEventDuty({
          variables: {
            name: values.name,
            urduName: values.urduName,
          },
        })
      )
      .then(() => {
        message.success('Event duty created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        // Ignore form validation errors; show mutation errors.
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (record: EventDutyRow) => {
    removeSecurityEventDuty({
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

  const totalResults = allSecurityEventDuties.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allSecurityEventDuties.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: EventDutyRow) => (
        <Link to={`${paths.eventDutiesPath}/${record._id}`}>
          {text}
        </Link>
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
      render: (_text: unknown, record: EventDutyRow) => {
        if (record.overallUsedCount !== 0) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this event duty?"
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
              New Event Duty
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
        title="New Event Duty"
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
