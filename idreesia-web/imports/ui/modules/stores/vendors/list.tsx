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
import type { VendorsByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';

import NewForm, { type NewVendorFormValues } from './new-form';
import {
  CREATE_VENDOR,
  REMOVE_VENDOR,
  VENDORS_BY_PHYSICAL_STORE_ID,
} from './gql';

const RouterLink = Link as any;
const DEFAULT_PAGE_SIZE = 20;
const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type VendorRow = NonNullable<
  NonNullable<VendorsByPhysicalStoreIdQuery['vendorsByPhysicalStoreId']>[number]
>;

const List = () => {
  const { physicalStoreId } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewVendorFormValues>();

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name ?? '', 'Setup', 'Vendors', 'List']
      : [ModuleNames.stores, 'Setup', 'Vendors', 'List']
  );

  const { data, loading, refetch } = useQuery(VENDORS_BY_PHYSICAL_STORE_ID, {
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

  const [createVendor, { loading: creating }] = useMutation(CREATE_VENDOR, {
    refetchQueries: [
      {
        query: VENDORS_BY_PHYSICAL_STORE_ID,
        variables: { physicalStoreId },
      },
    ],
  });

  const [removeVendor] = useMutation(REMOVE_VENDOR, {
    refetchQueries: [
      {
        query: VENDORS_BY_PHYSICAL_STORE_ID,
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

  const handleCreateVendor = () =>
    newForm
      .validateFields()
      .then((values) =>
        createVendor({
          variables: {
            name: values.name,
            physicalStoreId: physicalStoreId!,
            contactPerson: values.contactPerson,
            contactNumber: values.contactNumber,
            address: values.address,
            notes: values.notes,
          },
        })
      )
      .then(() => {
        message.success('Vendor created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (vendor: VendorRow) => {
    removeVendor({
      variables: {
        _id: vendor._id!,
        physicalStoreId: physicalStoreId!,
      },
    })
      .then(() => {
        message.success('Vendor has been deleted.', 5);
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

  const vendorsByPhysicalStoreId = (data?.vendorsByPhysicalStoreId ?? []).filter(
    (row): row is VendorRow => row != null
  );
  const totalResults = vendorsByPhysicalStoreId.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = vendorsByPhysicalStoreId.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: VendorRow) => (
        <RouterLink
          to={paths.vendorsEditFormPath(physicalStoreId!, record._id!)}
        >
          {text}
        </RouterLink>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 160,
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      width: 140,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Actions',
      key: 'action',
      width: 72,
      render: (_text: unknown, record: VendorRow) => {
        if (record.usageCount !== 0) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this vendor?"
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
          New Vendor
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
        title="New Vendor"
        open={showNewFormModal}
        width={640}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateVendor}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <NewForm form={newForm} />
      </Modal>
    </>
  );
};

export default List;
