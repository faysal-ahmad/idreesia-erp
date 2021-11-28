import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
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

import { flowRight, noop } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';

import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import AttachmentForm from './attachment-form';

const NameStyle = {
  cursor: 'pointer',
  color: '#1890ff',
};

const FileIconStyle = {
  fontSize: 30,
};

const AttachmentsList = props => {
  const [showForm, setShowForm] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [attachmentForm] = Form.useForm();

  const mimeTypeIconMap = {
    'image/jpeg': <FileJpgOutlined style={FileIconStyle} />,
    'text/html': <FileTextOutlined style={FileIconStyle} />,
    'application/pdf': <FilePdfOutlined style={FileIconStyle} />,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      <FileExcelOutlined style={FileIconStyle} />,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      <FileWordOutlined style={FileIconStyle} />,
  };

  const handleNameClicked = record => {
    const url = getDownloadUrl(record._id);
    window.open(url, '_blank');
  };

  const handleEditClicked = record => {
    setShowForm(true);
    setDefaultValues(record);
  };

  const handleDeleteClicked = attachmentId => {
    const { handleAttachmentRemoved } = props;
    handleAttachmentRemoved(attachmentId);
  };

  const handleAttachmentFormCancelled = () => {
    setShowForm(false);
  };

  const handleAttachmentFormSaved = () => {
    const { updateAttachment } = props;
    attachmentForm.validateFields().then(values => {
      setShowForm(false);
      updateAttachment({
        variables: {
          _id: defaultValues._id,
          name: values.name,
          description: values.description,
        },
      }).catch(error => {
        message.error(error.message, 5);
      });
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const icon = record.mimeType
          ? mimeTypeIconMap[record.mimeType]
          : <FileUnknownOutlined style={FileIconStyle} />;

        return (
          <Row
            type="flex"
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
    {
      key: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="View">
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
    },
  ];

  const {
    attachments,
    canTakePicture,
    canEditAttachments,
    handleAttachmentAdded,
  } = props;

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={attachments}
        columns={columns}
        bordered
        title={() => (
          <Row type="flex" gutter={16}>
            <Col order={1}>
              <UploadAttachment
                enabled={canEditAttachments}
                buttonText="Upload Attachment"
                onUploadFinish={handleAttachmentAdded}
              />
            </Col>
            {canTakePicture ? (
              <Col order={2}>
                <TakePicture
                  enabled={canEditAttachments}
                  buttonText="Capture Image"
                  onPictureTaken={handleAttachmentAdded}
                />
              </Col>
            ) : null}
          </Row>
        )}
      />
      <Modal
        visible={showForm}
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
  canEditAttachments: PropTypes.bool,
  handleAttachmentAdded: PropTypes.func,
  handleAttachmentRemoved: PropTypes.func,
  updateAttachment: PropTypes.func,
};

AttachmentsList.defaultProps = {
  attachments: [],
  canTakePicture: false,
  canEditAttachments: false,
  handleAttachmentAdded: noop,
  handleAttachmentRemoved: noop,
};

export default flowRight(
  graphql(updateAttachmentMutation, {
    name: 'updateAttachment',
  })
)(AttachmentsList);
