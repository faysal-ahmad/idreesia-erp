import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type { AllMehfilDutiesQuery } from 'meteor/idreesia-common/types/client-operations';

import {
  ALL_MEHFIL_DUTIES,
  CREATE_MEHFIL_DUTY,
  DELETE_MEHFIL_DUTY,
  UPDATE_MEHFIL_DUTY,
} from './gql';

type MehfilDuty = NonNullable<
  NonNullable<AllMehfilDutiesQuery['allMehfilDuties']>[number]
>;

interface FormValues {
  name: string;
  description?: string;
}

// The duties every mehfil's Duties and Attendance chooses from.
const MehfilDuties = () => {
  const [form] = Form.useForm<FormValues>();
  const [editing, setEditing] = useState<MehfilDuty | 'new' | null>(null);

  const { data, loading, refetch } = useQuery(ALL_MEHFIL_DUTIES, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const duties = (data?.allMehfilDuties ?? []).filter(
    (duty): duty is MehfilDuty => duty != null
  );

  const refetchQueries = [{ query: ALL_MEHFIL_DUTIES }];
  const [createDuty, { loading: creating }] = useMutation(CREATE_MEHFIL_DUTY, {
    refetchQueries,
  });
  const [updateDuty, { loading: updating }] = useMutation(UPDATE_MEHFIL_DUTY, {
    refetchQueries,
  });
  const [deleteDuty] = useMutation(DELETE_MEHFIL_DUTY, { refetchQueries });

  const openForm = (duty: MehfilDuty | 'new') => {
    form.resetFields();
    form.setFieldsValue(
      duty === 'new'
        ? { name: '', description: '' }
        : { name: duty.name, description: duty.description ?? '' }
    );
    setEditing(duty);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing === 'new') {
        await createDuty({
          variables: {
            name: values.name,
            description: values.description || undefined,
          },
        });
        message.success('Duty created', 2);
      } else if (editing) {
        await updateDuty({
          variables: {
            _id: editing._id,
            name: values.name,
            // An empty description clears it.
            description: values.description ?? '',
          },
        });
        message.success('Duty saved', 2);
      }
      setEditing(null);
    } catch (error) {
      // Form validation errors show on the fields; show mutation errors.
      if ((error as Error)?.message && !(error as any).errorFields) {
        message.error((error as Error).message, 5);
      }
    }
  };

  const handleDelete = (duty: MehfilDuty) => {
    deleteDuty({ variables: { _id: duty._id } })
      .then(() => {
        message.success('Duty deleted', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const columns: any[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text?: string | null) => text ?? '',
    },
    {
      key: 'action',
      width: 96,
      render: (_text: unknown, duty: MehfilDuty) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => openForm(duty)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this duty?"
            description="A duty that a mehfil is using can't be deleted."
            onConfirm={() => handleDelete(duty)}
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
      <div className="list-container">
        <div className="list-table-header" style={{ marginBottom: 12 }}>
          <Space size={12}>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => openForm('new')}
            >
              New Duty
            </Button>
          </Space>
          <div className="list-table-header-utilities">
            <Space size={8}>
              <Button
                icon={<SyncOutlined />}
                title="Reload Data"
                onClick={() =>
                  refetch().then(() => {
                    message.success('Data Reloaded', 2);
                  })
                }
              />
            </Space>
          </div>
        </div>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={duties}
          columns={columns}
          loading={loading && !data}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          locale={{ emptyText: 'No duties yet' }}
        />
      </div>

      <Modal
        title={editing === 'new' ? 'New Duty' : 'Edit Duty'}
        open={editing != null}
        okText="Save"
        confirmLoading={creating || updating}
        onOk={handleOk}
        onCancel={() => setEditing(null)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the duty name.' }]}
            extra={
              editing && editing !== 'new'
                ? 'Renaming the duty renames it in every mehfil that uses it.'
                : undefined
            }
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} maxLength={2000} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MehfilDuties;
