import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight, noop } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';

import {
  Col,
  Divider,
  Icon,
  Modal,
  Row,
  Table,
  Tooltip,
  Popconfirm,
  message,
} from '/imports/ui/controls';
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

class AttachmentsList extends Component {
  static propTypes = {
    attachments: PropTypes.array,
    canEditAttachments: PropTypes.bool,
    handleAttachmentAdded: PropTypes.func,
    handleAttachmentRemoved: PropTypes.func,
    updateAttachment: PropTypes.func,
  };

  static defaultProps = {
    attachments: [],
    canEditAttachments: false,
    handleAttachmentAdded: noop,
    handleAttachmentRemoved: noop,
  };

  state = {
    showForm: false,
    defaultValues: {},
  };

  attachmentForm;

  mimeTypeIconMap = {
    'image/jpeg': 'file-jpg',
    'text/html': 'file-text',
    'application/pdf': 'file-pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      'file-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'file-word',
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        let iconType = record.mimeType
          ? this.mimeTypeIconMap[record.mimeType]
          : 'file-unknown';
        if (!iconType) iconType = 'file';

        return (
          <Row
            type="flex"
            align="middle"
            gutter={6}
            onClick={() => {
              this.handleNameClicked(record);
            }}
          >
            <Col order={1}>
              <Icon type={iconType} style={FileIconStyle} />
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
            <Icon
              type="edit"
              className="list-actions-icon"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure you want to delete this document?"
            onConfirm={() => {
              this.handleDeleteClicked(record._id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Icon type="delete" className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </span>
      ),
    },
  ];

  handleNameClicked = record => {
    const url = getDownloadUrl(record._id);
    window.open(url, '_blank');
  };

  handleEditClicked = record => {
    this.setState({ showForm: true, defaultValues: record });
  };

  handleDeleteClicked = attachmentId => {
    const { handleAttachmentRemoved } = this.props;
    handleAttachmentRemoved(attachmentId);
  };

  handleAttachmentFormCancelled = () => {
    this.setState({ showForm: false });
  };

  handleAttachmentFormSaved = () => {
    const { updateAttachment } = this.props;
    const { defaultValues } = this.state;
    this.attachmentForm.validateFields(null, (errors, values) => {
      if (!errors) {
        this.setState({ showForm: false });
        updateAttachment({
          variables: {
            _id: defaultValues._id,
            name: values.name,
            description: values.description,
          },
        }).catch(error => {
          message.error(error.message, 5);
        });
      }
    });
  };

  render() {
    const { showForm, defaultValues } = this.state;
    const {
      attachments,
      canEditAttachments,
      handleAttachmentAdded,
    } = this.props;

    return (
      <Fragment>
        <Table
          rowKey="_id"
          dataSource={attachments}
          columns={this.columns}
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
              <Col order={2}>
                <TakePicture
                  enabled={canEditAttachments}
                  buttonText="Capture Image"
                  onPictureTaken={handleAttachmentAdded}
                />
              </Col>
            </Row>
          )}
        />
        <Modal
          visible={showForm}
          title="Edit Attachment"
          okText="Save"
          width={600}
          destroyOnClose
          onOk={this.handleAttachmentFormSaved}
          onCancel={this.handleAttachmentFormCancelled}
        >
          <AttachmentForm
            ref={f => {
              this.attachmentForm = f;
            }}
            defaultValues={defaultValues}
          />
        </Modal>
      </Fragment>
    );
  }
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

export default flowRight(
  graphql(updateAttachmentMutation, {
    name: 'updateAttachment',
  })
)(AttachmentsList);
