import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';

import {
  MessageStatus,
  MessageStatusDescription,
} from 'meteor/idreesia-common/constants/communication';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import {
  Button,
  Drawer,
  Icon,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import ListFilter from './list-filter';
import MessageResults from './message-results';
import {
  PAGED_HR_MESSAGES,
  APPROVE_HR_MESSAGE,
  DELETE_HR_MESSAGE,
} from '../gql';

const LinkStyle = {
  width: '100%',
  color: '#1890FF',
  cursor: 'pointer',
};

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const [messageIdForResults, setMessageIdForResults] = useState(null);
  const [succeededForResults, setSucceededForResults] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['startDate', 'endDate', 'pageIndex', 'pageSize'],
  });

  const [deleteHrMessage] = useMutation(DELETE_HR_MESSAGE);
  const [approveHrMessage] = useMutation(APPROVE_HR_MESSAGE);
  const { data, loading, refetch } = useQuery(PAGED_HR_MESSAGES, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Messages', 'List']));
  }, [location]);

  const handleNewClicked = () => {
    history.push(paths.messagesNewFormPath);
  };

  const handleDeleteItem = _message => {
    deleteHrMessage({
      variables: { _id: _message._id },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleApproveItem = _message => {
    approveHrMessage({
      variables: { _id: _message._id },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const onPaginationChange = (pageIndex, pageSize) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  const showResultForMessage = (messageId, succeeded) => {
    setMessageIdForResults(messageId);
    setSucceededForResults(succeeded);
    setShowResults(true);
  };

  if (loading) return null;
  const { pagedHrMessages } = data;
  const { startDate, endDate, pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns = [
    {
      title: 'Message',
      dataIndex: 'messageBody',
      key: 'messageBody',
      render: (text, record) => {
        const messageText =
          text.length < 40 ? text : `${text.substring(0, 37)}...`;
        return (
          <Tooltip title={text}>
            <Link to={`${paths.messagesEditFormPath(record._id)}`}>
              {messageText}
            </Link>
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
                showResultForMessage(record._id, true);
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
                showResultForMessage(record._id, false);
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
              <Icon
                type="like"
                className="list-actions-icon"
                onClick={() => {
                  handleApproveItem(record);
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
                handleDeleteItem(record);
              }}
              key="delete"
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Icon type="delete" className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          );
        }

        return <div className="list-actions-column">{actions}</div>;
      },
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button
        size="large"
        type="primary"
        icon="plus-circle-o"
        onClick={handleNewClicked}
      >
        New Message
      </Button>
      <ListFilter
        startDate={startDate}
        endDate={endDate}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={pagedHrMessages.data}
        columns={columns}
        bordered
        pagination={false}
        title={getTableHeader}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onPaginationChange}
            onShowSizeChange={onPaginationChange}
            total={pagedHrMessages.totalResults}
          />
        )}
      />
      <Drawer
        title={
          succeededForResults
            ? 'Message Results - Sent'
            : 'Message Results - Failed'
        }
        width={720}
        onClose={() => {
          setShowResults(false);
        }}
        visible={showResults}
      >
        <MessageResults
          messageId={messageIdForResults}
          succeeded={succeededForResults}
        />
      </Drawer>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
