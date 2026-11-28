import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Space, Spin, Table } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { ManagedPhysicalStoresQuery } from 'meteor/idreesia-common/types/client-operations';

import { default as paths } from '../submodule-paths';
import { CREATE_PHYSICAL_STORE, MANAGED_PHYSICAL_STORES } from './gql';
import { STORE_LIST_QUERIES } from './refetch';
import useManageStoresAccess from './use-manage-stores-access';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

type StoreRow = NonNullable<
  NonNullable<ManagedPhysicalStoresQuery['managedPhysicalStores']>[number]
> & { _id: string };

interface NewStoreValues {
  name: string;
  address?: string;
}

/** Every physical store, with a new store created in a modal. */
const List = () => {
  useBreadcrumbs([ModuleNames.stores, 'Administration', 'Manage Stores']);
  const [form] = Form.useForm<NewStoreValues>();
  const [showNewForm, setShowNewForm] = useState(false);
  const { canManageStores } = useManageStoresAccess();

  const { data, loading, refetch } = useQuery(MANAGED_PHYSICAL_STORES, {
    fetchPolicy: 'cache-and-network',
  });
  const [createPhysicalStore, { loading: creating }] = useMutation(CREATE_PHYSICAL_STORE, {
    refetchQueries: STORE_LIST_QUERIES,
  });

  const stores = (data?.managedPhysicalStores ?? []).filter(
    (store): store is StoreRow => store != null && store._id != null
  );

  const handleNewClicked = () => {
    form.resetFields();
    setShowNewForm(true);
  };

  const handleCreate = () =>
    form
      .validateFields()
      .then((values) =>
        createPhysicalStore({
          variables: { name: values.name, address: values.address },
        })
      )
      .then(() => {
        message.success('Store created', 2);
        setShowNewForm(false);
      })
      .catch((error: Error) => {
        // Form validation errors show on the fields; show mutation errors.
        if (error?.message) message.error(error.message, 5);
      });

  if (loading && !data) {
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
      render: (text: string, record: StoreRow) => (
        <Link to={paths.manageStoresEditFormPath(record._id)}>{text}</Link>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  return (
    <>
      <div className="list-container">
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={stores}
          columns={columns}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          locale={{ emptyText: 'No stores yet' }}
          title={() => (
            <div className="list-table-header">
              <Space size={12}>
                {canManageStores ? (
                  <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleNewClicked}>
                    New Store
                  </Button>
                ) : null}
              </Space>
              <div className="list-table-header-utilities">
                <Space size={8}>
                  <Button
                    icon={<SyncOutlined />}
                    title="Reload Data"
                    onClick={() => refetch().then(() => message.success('Data Reloaded', 2))}
                  />
                </Space>
              </div>
            </div>
          )}
        />
      </div>

      <Modal
        title="New Store"
        open={showNewForm}
        width={560}
        okText="Save"
        confirmLoading={creating}
        onOk={handleCreate}
        onCancel={() => setShowNewForm(false)}
        destroyOnHidden
        forceRender
      >
        <Form form={form} layout="horizontal" style={{ width: '100%', maxWidth: '100%' }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input a name for the store.' }]}
            {...formItemLayout}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="address" label="Address" {...formItemLayout}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default List;
