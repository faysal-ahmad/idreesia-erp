import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DeleteOutlined, LikeOutlined } from '@ant-design/icons';

import { noop, toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  MessageStatus,
  MessageStatusDescription,
} from 'meteor/idreesia-common/constants/communication';

import {
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
} from 'antd';

const LinkStyle = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

export default class MessagesList extends Component {
  static propTypes = {
    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    handleApproveItem: PropTypes.func,
    showResultForMessage: PropTypes.func,
    setPageParams: PropTypes.func,

    pageIndex: PropTypes.string,
    pageSize: PropTypes.string,
    pagedData: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  static defaultProps = {
    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleApproveItem: noop,
    showResultForMessage: noop,
    listHeader: () => null,
  };

  columns = [
    {
      title: 'Message',
      dataIndex: 'messageBody',
      key: 'messageBody',
      render: (text, record) => {
        const messageText =
          text.length < 40 ? text : `${text.substring(0, 37)}...`;
        return (
          <Tooltip title={text}>
            <div
              style={LinkStyle}
              onClick={() => {
                this.props.handleSelectItem(record);
              }}
            >
              {messageText}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: text => MessageStatusDescription[text],
    },
    {
      title: 'Selected',
      dataIndex: 'karkunCount',
      key: 'karkunCount',
    },
    {
      title: 'Sent',
      dataIndex: 'succeededMessageCount',
      key: 'succeededMessageCount',
      render: (text, record) => {
        if (text !== 0) {
          return (
            <div
              style={LinkStyle}
              onClick={() => {
                this.props.showResultForMessage(record._id, true);
              }}
            >
              {text}
            </div>
          );
        }

        return text;
      },
    },
    {
      title: 'Failed',
      dataIndex: 'failedMessageCount',
      key: 'failedMessageCount',
      render: (text, record) => {
        if (text !== 0) {
          return (
            <div
              style={LinkStyle}
              onClick={() => {
                this.props.showResultForMessage(record._id, false);
              }}
            >
              {text}
            </div>
          );
        }

        return text;
      },
    },
    {
      title: 'Sent Date',
      dataIndex: 'sentDate',
      key: 'sentDate',
      render: text => {
        if (text) {
          const date = moment(Number(text));
          return date.format('DD MMM, YYYY');
        }

        return '';
      },
    },
    {
      key: 'action',
      width: 70,
      render: (text, record) => {
        const { status } = record;
        const actions = [];

        if (status === MessageStatus.WAITING_APPROVAL) {
          actions.push(
            <Tooltip key="approve" title="Approve">
              <LikeOutlined
                className="list-actions-icon"
                onClick={() => {
                  this.props.handleApproveItem(record);
                }}
              />
            </Tooltip>
          );
        }

        if (status !== MessageStatus.SENDING) {
          actions.push(
            <Popconfirm
              title="Are you sure you want to delete this message?"
              onConfirm={() => {
                this.props.handleDeleteItem(record);
              }}
              key="delete"
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <DeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          );
        }

        return <div className="list-actions-column">{actions}</div>;
      },
    },
  ];

  onPaginationChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: (pageIndex - 1).toString(),
      pageSize: pageSize.toString(),
    });
  };

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      pagedData: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        title={listHeader}
        bordered
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={this.onPaginationChange}
            onShowSizeChange={this.onPaginationChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}
