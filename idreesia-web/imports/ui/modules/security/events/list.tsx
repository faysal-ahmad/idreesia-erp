import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
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
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllSecurityEventsQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import NewForm, { type NewEventFormValues } from './new-form';
import { ALL_SECURITY_EVENTS, CREATE_SECURITY_EVENT, REMOVE_SECURITY_EVENT } from './gql';

const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type SecurityEventRecord = NonNullable<NonNullable<AllSecurityEventsQuery['allSecurityEvents']>[number]>;

const List = () => {
  useBreadcrumbs(['Security', 'Events']);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewEventFormValues>();

  const { data, loading, refetch } = useQuery(ALL_SECURITY_EVENTS);
  const allSecurityEvents = (data?.allSecurityEvents ?? []).filter(
    (event): event is SecurityEventRecord => event != null && event._id != null
  );

  const [createSecurityEvent, { loading: creating }] = useMutation(CREATE_SECURITY_EVENT, {
    refetchQueries: [{ query: ALL_SECURITY_EVENTS }],
  });
  const [removeSecurityEvent] = useMutation(REMOVE_SECURITY_EVENT, {
    refetchQueries: [{ query: ALL_SECURITY_EVENTS }],
  });

  const updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const footer = table.querySelector('.ant-table-footer');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 64;

      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit =
          contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit -
            titleBottom -
            theadHeight -
            footerHeight -
            VIEWPORT_BOTTOM_GAP
        )
      );

      setScrollY((prev) =>
        Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev
      );
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  const handleNewClicked = () => {
    newForm.resetFields();
    setShowNewFormModal(true);
  };

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreateEvent = () =>
    newForm
      .validateFields()
      .then((values) =>
        createSecurityEvent({
          variables: {
            name: values.name,
            eventDate: String(values.eventDate.valueOf()),
          },
        })
      )
      .then(() => {
        message.success('Event created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (record: SecurityEventRecord) => {
    removeSecurityEvent({
      variables: {
        _id: record._id ?? '',
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

  const totalResults = allSecurityEvents.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allSecurityEvents.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SecurityEventRecord) => (
        <Link to={paths.eventsEditFormPath(record._id ?? '')}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Event Date',
      dataIndex: 'eventDate',
      key: 'eventDate',
      width: 160,
      render: (text: string | number | null) => {
        const eventDate = dayjs(Number(text));
        return eventDate.isValid() ? eventDate.format('DD MMM, YYYY') : '';
      },
    },
    {
      title: 'Karkun Count',
      dataIndex: 'karkunCount',
      key: 'karkunCount',
      width: 130,
    },
    {
      key: 'action',
      width: 90,
      render: (_text: unknown, record: SecurityEventRecord) => {
        const deleteAction =
          record.karkunCount === 0 ? (
            <Popconfirm
              key="delete"
              title="Are you sure you want to delete this event?"
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
          ) : null;

        return (
          <div className="list-actions-column">
            {deleteAction}
          </div>
        );
      },
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Event
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
  );

  return (
    <>
      <div className="list-container" ref={containerRef}>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={pageData}
          columns={columns}
          title={getTableHeader}
          bordered
          size="medium"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
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
        title="New Event"
        open={showNewFormModal}
        width={560}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateEvent}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <NewForm form={newForm} />
      </Modal>
    </>
  );
};

export default List;
