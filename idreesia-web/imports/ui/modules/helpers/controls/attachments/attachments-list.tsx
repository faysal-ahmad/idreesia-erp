import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
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

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';

import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import AttachmentForm from './attachment-form';

const AntCol = Col as any;
const AntDivider = Divider as any;
const AntForm = Form as any;
const AntModal = Modal as any;
const AntRow = Row as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntPopconfirm = Popconfirm as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntEditOutlined = EditOutlined as any;
const AntFileJpgOutlined = FileJpgOutlined as any;
const AntFileTextOutlined = FileTextOutlined as any;
const AntFilePdfOutlined = FilePdfOutlined as any;
const AntFileExcelOutlined = FileExcelOutlined as any;
const AntFileWordOutlined = FileWordOutlined as any;
const AntFileUnknownOutlined = FileUnknownOutlined as any;
const TakePictureControl = TakePicture as any;
const UploadAttachmentControl = UploadAttachment as any;
const AttachmentEditForm = AttachmentForm as any;
interface Attachment { _id: string; name?: string; description?: string; mimeType?: string; }
interface Props { attachments?: Attachment[]; canTakePicture?: boolean; canUploadDocument?: boolean; canEditAttachments?: boolean; handleAttachmentAdded?(id: string): void; handleAttachmentRemoved?(id: string): void; }
interface FormValues { name?: string; description?: string; }

const NameStyle = {
  cursor: 'pointer',
  color: '#1890ff',
};

const FileIconStyle = {
  fontSize: 30,
};

const AttachmentsList = ({
  attachments,
  canTakePicture,
  canUploadDocument,
  canEditAttachments,
  handleAttachmentAdded,
  handleAttachmentRemoved,
}: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Attachment>({ _id: '' });
  const [attachmentForm] = AntForm.useForm();
  const [updateAttachment] = useMutation(updateAttachmentMutation as any);

  const mimeTypeIconMap: Record<string, React.ReactNode> = {
    'image/jpeg': <AntFileJpgOutlined style={FileIconStyle as any} />,
    'text/html': <AntFileTextOutlined style={FileIconStyle as any} />,
    'application/pdf': <AntFilePdfOutlined style={FileIconStyle as any} />,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      <AntFileExcelOutlined style={FileIconStyle as any} />,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      <AntFileWordOutlined style={FileIconStyle as any} />,
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
    handleAttachmentRemoved?.(attachmentId);
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
          : <AntFileUnknownOutlined style={FileIconStyle as any} />;

        return (
          <AntRow
            type="flex"
            align="middle"
            gutter={6}
            onClick={() => {
              handleNameClicked(record);
            }}
          >
            <AntCol order={1}>
              {icon}
            </AntCol>
            <AntCol order={2} style={NameStyle as any}>
              {record.name}
            </AntCol>
          </AntRow>
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
          <AntTooltip title="Edit">
            <AntEditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </AntTooltip>
          <AntDivider type="vertical" />
          <AntPopconfirm
            title="Are you sure you want to delete this document?"
            onConfirm={() => {
              handleDeleteClicked(record._id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <AntTooltip title="Delete">
              <AntDeleteOutlined className="list-actions-icon" />
            </AntTooltip>
          </AntPopconfirm>
        </span>
      ),
    });
  }

  return (
    <>
      <AntTable
        rowKey="_id"
        dataSource={attachments}
        columns={columns}
        bordered
        title={() => (
          <AntRow type="flex" gutter={16}>
            <AntCol order={1}>
              <UploadAttachmentControl
                disabled={!canUploadDocument}
                buttonText="Upload Attachment"
                onUploadFinish={handleAttachmentAdded}
              />
            </AntCol>
            {canTakePicture ? (
              <AntCol order={2}>
                <TakePictureControl
                  disabled={!canTakePicture}
                  buttonText="Capture Image"
                  onPictureTaken={handleAttachmentAdded}
                />
              </AntCol>
            ) : null}
          </AntRow>
        )}
      />
      <AntModal
        open={showForm}
        title="Edit Attachment"
        okText="Save"
        width={600}
        destroyOnClose
        onOk={handleAttachmentFormSaved}
        onCancel={handleAttachmentFormCancelled}
      >
        <AttachmentEditForm
          form={attachmentForm}
          defaultValues={defaultValues}
        />
      </AntModal>
    </>
  );
}

const updateAttachmentMutation = gql`
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

AttachmentsList.propTypes = {
  attachments: PropTypes.array,
  canTakePicture: PropTypes.bool,
  canUploadDocument: PropTypes.bool,
  canEditAttachments: PropTypes.bool,
  handleAttachmentAdded: PropTypes.func,
  handleAttachmentRemoved: PropTypes.func,
};

AttachmentsList.defaultProps = {
  attachments: [],
  canTakePicture: false,
  canUploadDocument: false,
  canEditAttachments: false,
  handleAttachmentAdded: noop,
  handleAttachmentRemoved: noop,
};

export default AttachmentsList;
