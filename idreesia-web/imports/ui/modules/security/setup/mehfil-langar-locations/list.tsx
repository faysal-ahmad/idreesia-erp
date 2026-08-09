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
import type { AllSecurityMehfilLangarLocationsQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import NewForm, { type NewLangarLocationFormValues } from './new-form';
import {
  ALL_SECURITY_MEHFIL_LANGAR_LOCATIONS,
  CREATE_SECURITY_MEHFIL_LANGAR_LOCATION,
  REMOVE_SECURITY_MEHFIL_LANGAR_LOCATION,
} from './gql';

const RouterLink = Link as any;

const DEFAULT_PAGE_SIZE = 20;

type LangarLocationRow = NonNullable<
  NonNullable<
    AllSecurityMehfilLangarLocationsQuery['allSecurityMehfilLangarLocations']
  >[number]
>;

const List = () => {
  useBreadcrumbs(['Security', 'Langar Locations']);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [newForm] = Form.useForm<NewLangarLocationFormValues>();

  const { data, loading, refetch } = useQuery(
    ALL_SECURITY_MEHFIL_LANGAR_LOCATIONS
  );
  const allSecurityMehfilLangarLocations = (
    data?.allSecurityMehfilLangarLocations ?? []
  ).filter((row): row is LangarLocationRow => row != null && row._id != null);

  const [createSecurityMehfilLangarLocation, { loading: creating }] =
    useMutation(CREATE_SECURITY_MEHFIL_LANGAR_LOCATION, {
      refetchQueries: ['allSecurityMehfilLangarLocations'],
    });
  const [removeSecurityMehfilLangarLocation] = useMutation(
    REMOVE_SECURITY_MEHFIL_LANGAR_LOCATION,
    {
      refetchQueries: ['allSecurityMehfilLangarLocations'],
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

  const handleCreateLocation = () =>
    newForm
      .validateFields()
      .then((values) =>
        createSecurityMehfilLangarLocation({
          variables: {
            name: values.name,
            urduName: values.urduName,
          },
        })
      )
      .then(() => {
        message.success('Langar location created', 2);
        handleCloseNewForm();
      })
      .catch((error: Error) => {
        if (error?.message) {
          message.error(error.message, 5);
        }
      });

  const handleDeleteClicked = (record: LangarLocationRow) => {
    removeSecurityMehfilLangarLocation({
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

  const totalResults = allSecurityMehfilLangarLocations.length;
  const maxPageIndex = Math.max(0, Math.ceil(totalResults / pageSize) - 1);
  const safePageIndex = Math.min(pageIndex, maxPageIndex);
  const pageData = allSecurityMehfilLangarLocations.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LangarLocationRow) => (
        <RouterLink to={`${paths.mehfilLangarLocationsPath}/${record._id}`}>
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
      render: (_text: unknown, record: LangarLocationRow) => {
        if (record.overallUsedCount !== 0) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this langar location?"
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
              New Langar Location
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
        title="New Langar Location"
        open={showNewFormModal}
        width={560}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreateLocation}
        onCancel={handleCloseNewForm}
        destroyOnHidden
      >
        <NewForm form={newForm} />
      </Modal>
    </>
  );
};

export default List;
