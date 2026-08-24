import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Form, Modal, Popconfirm, Space, Spin, Table, Tag, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllPeopleTagsQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  ColorField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

import {
  ALL_PEOPLE_TAGS,
  CREATE_PEOPLE_TAG,
  UPDATE_PEOPLE_TAG,
  DELETE_PEOPLE_TAG,
} from './gql';

type PeopleTagRow = NonNullable<
  NonNullable<AllPeopleTagsQuery['allPeopleTags']>[number]
>;

interface FormValues {
  name: string;
  color: string;
  textColor: string;
  moduleNames: string[];
}

interface ModuleNameOption {
  value: string;
  text: string;
}

const moduleNamesData: ModuleNameOption[] = values(ModuleNames).map(
  (name: string) => ({ value: name, text: name })
);

const List = () => {
  useBreadcrumbs(['Admin', 'People Tags']);

  const [form] = Form.useForm<FormValues>();
  const [editingRecord, setEditingRecord] = useState<PeopleTagRow | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  const { data, loading, refetch } = useQuery(ALL_PEOPLE_TAGS);
  const peopleTags: PeopleTagRow[] = (data?.allPeopleTags ?? []).filter(
    (row): row is PeopleTagRow => row != null && row._id != null
  );

  const [createPeopleTag, { loading: creating }] = useMutation(
    CREATE_PEOPLE_TAG,
    { refetchQueries: [{ query: ALL_PEOPLE_TAGS }] }
  );
  const [updatePeopleTag, { loading: updating }] = useMutation(
    UPDATE_PEOPLE_TAG,
    { refetchQueries: [{ query: ALL_PEOPLE_TAGS }] }
  );
  const [deletePeopleTag] = useMutation(DELETE_PEOPLE_TAG, {
    refetchQueries: [{ query: ALL_PEOPLE_TAGS }],
  });

  const handleNewClicked = () => {
    setEditingRecord(null);
    form.resetFields();
    setShowModal(true);
  };

  const handleEditClicked = (record: PeopleTagRow) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name ?? undefined,
      color: record.color ?? undefined,
      textColor: record.textColor ?? undefined,
      moduleNames: (record.moduleNames ?? []).filter(
        (moduleName): moduleName is string => moduleName != null
      ),
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const { name, color, textColor, moduleNames } =
        await form.validateFields();

      if (editingRecord) {
        await updatePeopleTag({
          variables: {
            _id: editingRecord._id!,
            name,
            color,
            textColor,
            moduleNames,
          },
        });
      } else {
        await createPeopleTag({
          variables: { name, color, textColor, moduleNames },
        });
      }

      message.success(editingRecord ? 'Tag updated.' : 'Tag created.', 2);
      handleCloseModal();
    } catch (error: any) {
      // Ignore form validation errors; show mutation errors.
      if (error?.message) {
        message.error(error.message, 5);
      }
    }
  };

  const handleDeleteClicked = (record: PeopleTagRow) => {
    deletePeopleTag({ variables: { _id: record._id! } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );
  };

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  if (loading) {
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
      render: (text: string, record: PeopleTagRow) => (
        <Tag
          color={record.color ?? undefined}
          variant="solid"
          style={{ color: record.textColor ?? undefined }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Modules',
      dataIndex: 'moduleNames',
      key: 'moduleNames',
      render: (moduleNames: (string | null)[] | null) =>
        (moduleNames ?? []).map((moduleName) => (
          <Tag key={moduleName}>{moduleName}</Tag>
        )),
    },
    {
      key: 'action',
      width: 96,
      render: (_text: unknown, record: PeopleTagRow) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => handleEditClicked(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this tag?"
            onConfirm={() => handleDeleteClicked(record)}
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
              onClick={handleNewClicked}
            >
              New Tag
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
          dataSource={peopleTags}
          columns={columns}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
        />
      </div>

      <Modal
        title={editingRecord ? 'Edit Tag' : 'New Tag'}
        open={showModal}
        width={560}
        okText="Save"
        confirmLoading={creating || updating}
        onOk={handleSave}
        onCancel={handleCloseModal}
        destroyOnHidden
      >
        <Form form={form} layout="horizontal">
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            required
            requiredMessage="Please input a name for the tag."
          />

          <ColorField
            fieldName="color"
            fieldLabel="Color"
            required
            requiredMessage="Please pick a color for the tag."
          />

          <ColorField
            fieldName="textColor"
            fieldLabel="Text Color"
            required
            requiredMessage="Please pick a text color for the tag."
          />

          <SelectField
            data={moduleNamesData}
            getDataValue={({ value }: ModuleNameOption) => value}
            getDataText={({ text }: ModuleNameOption) => text}
            fieldName="moduleNames"
            fieldLabel="Modules"
            mode="multiple"
            initialValue={[]}
            required
            requiredMessage="Please select at least one module."
          />
        </Form>
      </Modal>
    </>
  );
};

export default List;
