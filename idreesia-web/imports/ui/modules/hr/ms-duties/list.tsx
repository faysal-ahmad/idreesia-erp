import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
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
import type {
  CreateDutyMutation,
  CreateDutyMutationVariables,
  ListAllMsDutiesQuery,
  ListAllMsDutiesQueryVariables,
  RemoveDutyMutation,
  RemoveDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import NewForm, { type NewDutyFormValues } from './new-form';

const RouterLink = Link as any;

const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

const LIST_ALL_MS_DUTIES: TypedDocumentNode<
  ListAllMsDutiesQuery,
  ListAllMsDutiesQueryVariables
> = gql`
  query listAllMSDuties {
    allMSDuties {
      _id
      name
      description
      canDelete
      shifts {
        _id
        name
      }
    }
  }
`;

const CREATE_DUTY: TypedDocumentNode<
  CreateDutyMutation,
  CreateDutyMutationVariables
> = gql`
  mutation createDuty(
    $name: String!
    $isMehfilDuty: Boolean!
    $description: String
    $attendanceSheet: String
  ) {
    createDuty(
      name: $name
      isMehfilDuty: $isMehfilDuty
      description: $description
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      isMehfilDuty
      description
      attendanceSheet
    }
  }
`;

const REMOVE_DUTY: TypedDocumentNode<
  RemoveDutyMutation,
  RemoveDutyMutationVariables
> = gql`
  mutation removeDuty($_id: String!) {
    removeDuty(_id: $_id)
  }
`;

type DutyRow = NonNullable<
  NonNullable<ListAllMsDutiesQuery['allMSDuties']>[number]
> & { _id: string; name: string };

const List = () => {
  useBreadcrumbs(['HR', 'Duties & Shifts']);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewDutyFormValues>();

  const { data, loading, refetch } = useQuery(LIST_ALL_MS_DUTIES);
  const allMSDuties = (data?.allMSDuties ?? []).filter(
    (row): row is DutyRow =>
      row != null && row._id != null && row.name != null
  );

  const [createDuty, { loading: creating }] = useMutation(CREATE_DUTY, {
    refetchQueries: ['listAllMSDuties', 'allMSDuties'],
  });
  const [removeDuty] = useMutation(REMOVE_DUTY, {
    refetchQueries: ['listAllMSDuties', 'allMSDuties'],
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

      setScrollY(prev =>
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

  const handleCreateDuty = () =>
    newForm
      .validateFields()
      .then(values =>
        createDuty({
          variables: {
            name: values.name,
            isMehfilDuty: false,
            description: values.description,
            attendanceSheet: values.attendanceSheet,
          },
        })
      )
      .then(() => {
        message.success('Duty created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (record: DutyRow) => {
    removeDuty({
      variables: {
        _id: record._id,
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

  const totalResults = allMSDuties.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allMSDuties.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: DutyRow) => (
        <RouterLink to={paths.msDutiesEditFormPath(record._id)}>
          {text}
        </RouterLink>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'Shifts',
      dataIndex: 'shifts',
      key: 'shifts',
      render: (_text: unknown, record: DutyRow) => {
        if (!record.shifts || record.shifts.length === 0) return null;
        const shiftNames = record.shifts
          .filter(shift => shift?.name)
          .map(shift => shift!.name);
        return shiftNames.join(', ');
      },
    },
    {
      key: 'action',
      width: 72,
      render: (_text: unknown, record: DutyRow) => {
        if (!record.canDelete) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this duty?"
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

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Duty
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
          size="middle"
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
        title="New Duty"
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
