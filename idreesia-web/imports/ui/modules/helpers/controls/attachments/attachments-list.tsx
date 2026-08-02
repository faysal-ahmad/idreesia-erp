import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateAttachmentMutation,
  UpdateAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  DeleteOutlined,
  EditOutlined,
  FileJpgOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileUnknownOutlined,
} from '@ant-design/icons';
import {
  Col,
  Divider,
  Form,
  Modal,
  Row,
  Table,
  Tooltip,
  Popconfirm,
  message,
} from 'antd';
import { type CSSProperties } from 'react';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';

import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import AttachmentForm from './attachment-form';

interface Attachment {
  _id: string;
  name?: string;
  description?: string;
  mimeType?: string;
}

interface Props {
  attachments?: Attachment[];
  canTakePicture?: boolean;
  canUploadDocument?: boolean;
  canEditAttachments?: boolean;
  handleAttachmentAdded?(id: string): void;
  handleAttachmentRemoved?(id: string): void;
}

interface FormValues {
  name?: string;
  description?: string;
}

const NameStyle: CSSProperties = {
  cursor: 'pointer',
  color: '#1890ff',
};

const FileIconStyle: CSSProperties = {
  fontSize: 30,
};

const updateAttachmentMutation: TypedDocumentNode<
  UpdateAttachmentMutation,
  UpdateAttachmentMutationVariables
> = gql`
  mutation updateAttachment(
    $_id: String!
    $name: String
    $description: String
  ) {
    updateAttachment(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
      mimeType
    }
  }
`;

const AttachmentsList = ({
  attachments = [],
  canTakePicture = false,
  canUploadDocument = false,
  canEditAttachments = false,
  handleAttachmentAdded = noop,
  handleAttachmentRemoved = noop,
}: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Attachment>({ _id: '' });
  const [attachmentForm] = Form.useForm();
  const [updateAttachment] = useMutation(updateAttachmentMutation);

  const mimeTypeIconMap: Record<string, React.ReactNode> = {
    'image/jpeg': <FileJpgOutlined style={FileIconStyle} />,
    'text/html': <FileTextOutlined style={FileIconStyle} />,
    'application/pdf': <FilePdfOutlined style={FileIconStyle} />,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      <FileExcelOutlined style={FileIconStyle} />,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      <FileWordOutlined style={FileIconStyle} />,
  };

  const handleNameClicked = (record: Attachment) => {
    const url = getDownloadUrl(record._id);
    if (url) window.open(url, '_blank');
  };

  const handleEditClicked = (record: Attachment) => {
    setShowForm(true);
    setDefaultValues(record);
  };

  const handleDeleteClicked = (attachmentId: string) => {
    handleAttachmentRemoved(attachmentId);
  };

  const handleAttachmentFormCancelled = () => {
    setShowForm(false);
  };

  const handleAttachmentFormSaved = () => {
    attachmentForm.validateFields().then((values: FormValues) => {
      setShowForm(false);
      updateAttachment({
        variables: {
          _id: defaultValues._id,
          name: values.name,
          description: values.description,
        },
      }).catch((error: Error) => {
        message.error(error.message, 5);
      });
    });
  };

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_text: unknown, record: Attachment) => {
        const icon = record.mimeType
          ? mimeTypeIconMap[record.mimeType]
          : <FileUnknownOutlined style={FileIconStyle} />;

        return (
          <Row
            align="middle"
            gutter={6}
            onClick={() => {
              handleNameClicked(record);
            }}
          >
            <Col order={1}>
              {icon}
            </Col>
            <Col order={2} style={NameStyle}>
              {record.name}
            </Col>
          </Row>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  if (canEditAttachments) {
    columns.push({
      key: 'action',
      render: (_text: unknown, record: Attachment) => (
        <span>
          <Tooltip title="Edit">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure you want to delete this document?"
            onConfirm={() => {
              handleDeleteClicked(record._id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </span>
      ),
    });
  }

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={attachments}
        columns={columns as any}
        bordered
        title={() => (
          <Row gutter={16}>
            <Col order={1}>
              <UploadAttachment
                disabled={!canUploadDocument}
                buttonText="Upload Attachment"
                onUploadFinish={handleAttachmentAdded}
              />
            </Col>
            {canTakePicture ? (
              <Col order={2}>
                <TakePicture
                  disabled={!canTakePicture}
                  buttonText="Capture Image"
                  onPictureTaken={handleAttachmentAdded}
                />
              </Col>
            ) : null}
          </Row>
        )}
      />
      <Modal
        open={showForm}
        title="Edit Attachment"
        okText="Save"
        width={600}
        destroyOnClose
        onOk={handleAttachmentFormSaved}
        onCancel={handleAttachmentFormCancelled}
      >
        <AttachmentForm
          form={attachmentForm}
          defaultValues={defaultValues}
        />
      </Modal>
    </>
  );
};

export default AttachmentsList;
