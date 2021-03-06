import React, { useEffect } from 'react';
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
  Icon,
  Pagination,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import ListFilter from './list-filter';
import {
  PAGED_OUTSTATION_MESSAGES,
  APPROVE_OUTSTATION_MESSAGE,
  DELETE_OUTSTATION_MESSAGE,
} from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['startDate', 'endDate', 'pageIndex', 'pageSize'],
  });

  const [deleteOutstationMessage] = useMutation(DELETE_OUTSTATION_MESSAGE);
  const [approveOutstationMessage] = useMutation(APPROVE_OUTSTATION_MESSAGE);
  const { data, loading, refetch } = useQuery(PAGED_OUTSTATION_MESSAGES, {
    variables: {
      filter: queryParams,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Messages', 'List']));
  }, [location]);

  const handleNewClicked = () => {
    history.push(paths.messagesNewFormPath);
  };

  const handleDeleteItem = _message => {
    deleteOutstationMessage({
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
    approveOutstationMessage({
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

  if (loading) return null;
  const { pagedOutstationMessages } = data;
  const { startDate, endDate, pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns = [
    {
      title: 'Message',
      dataIndex: 'messageBody',
      key: 'messageBody',
      render: (text, record) => (
        <Link to={`${paths.messagesEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: text => MessageStatusDescription[text],
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
            <Tooltip key="delete" title="Delete">
              <Icon
                type="delete"
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteItem(record);
                }}
              />
            </Tooltip>
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
    <Table
      rowKey="_id"
      dataSource={pagedOutstationMessages.data}
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
          total={pagedOutstationMessages.totalResults}
        />
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
