import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
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

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { LocationsByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';

import NewForm, { type NewLocationFormValues } from './new-form';
import {
  CREATE_LOCATION,
  REMOVE_LOCATION,
  LOCATIONS_BY_PHYSICAL_STORE_ID,
} from './gql';

const RouterLink = Link as any;
const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type LocationRow = NonNullable<
  NonNullable<LocationsByPhysicalStoreIdQuery['locationsByPhysicalStoreId']>[number]
>;

const List = () => {
  const { physicalStoreId } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewLocationFormValues>();

  useDynamicBreadcrumbs(
    physicalStore
      ? [
          ModuleNames.stores,
          physicalStore.name ?? '',
          'Setup',
          'Locations',
          'List',
        ]
      : [ModuleNames.stores, 'Setup', 'Locations', 'List']
  );

  const { data, loading, refetch } = useQuery(LOCATIONS_BY_PHYSICAL_STORE_ID, {
    variables: { physicalStoreId: physicalStoreId! },
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

  const [createLocation, { loading: creating }] = useMutation(CREATE_LOCATION, {
    refetchQueries: [
      {
        query: LOCATIONS_BY_PHYSICAL_STORE_ID,
        variables: { physicalStoreId },
      },
    ],
  });

  const [removeLocation] = useMutation(REMOVE_LOCATION, {
    refetchQueries: [
      {
        query: LOCATIONS_BY_PHYSICAL_STORE_ID,
        variables: { physicalStoreId },
      },
    ],
  });

  const handleNewClicked = () => {
    newForm.resetFields();
    setShowNewFormModal(true);
  };

  const handleCloseNewForm = () => {
    setShowNewFormModal(false);
    newForm.resetFields();
  };

  const handleCreateLocation = () =>
    newForm
      .validateFields()
      .then((values) =>
        createLocation({
          variables: {
            name: values.name,
            physicalStoreId: physicalStoreId!,
            parentId: values.parentId,
            description: values.description,
          },
        })
      )
      .then(() => {
        message.success('Location created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (location: LocationRow) => {
    removeLocation({
      variables: {
        _id: location._id!,
        physicalStoreId: physicalStoreId!,
      },
    })
      .then(() => {
        message.success('Location has been deleted.', 5);
      })
      .catch((error: Error) => {
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

  const locationsByPhysicalStoreId = (
    data?.locationsByPhysicalStoreId ?? []
  ).filter((row): row is LocationRow => row != null);
  const totalResults = locationsByPhysicalStoreId.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = locationsByPhysicalStoreId.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LocationRow) => (
        <RouterLink
          to={paths.locationsEditFormPath(physicalStoreId!, record._id!)}
        >
          {text}
        </RouterLink>
      ),
    },
    {
      title: 'Parent Location',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 180,
      render: (_text: unknown, record: LocationRow) => {
        if (!record.parentId || !record.refParent?.name) return '';
        return (
          <RouterLink
            to={paths.locationsEditFormPath(physicalStoreId!, record.parentId)}
          >
            {record.refParent.name}
          </RouterLink>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'action',
      width: 72,
      render: (_text: unknown, record: LocationRow) => {
        if (record.isInUse) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this location?"
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
          New Location
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
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          title={getTableHeader}
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
        title="New Location"
        open={showNewFormModal}
        width={640}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateLocation}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <NewForm form={newForm} locations={locationsByPhysicalStoreId} />
      </Modal>
    </>
  );
};

export default List;
