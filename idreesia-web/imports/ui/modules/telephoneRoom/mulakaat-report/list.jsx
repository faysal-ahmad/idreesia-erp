import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';

import {
  Button,
  DatePicker,
  Modal,
  Pagination,
  Table,
  message,
} from '/imports/ui/controls';
import { VisitorName } from '/imports/ui/modules/security/common/controls';

import {
  CANCEL_TELEPHONE_ROOM_VISITOR_MULAKAATS,
  PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS,
} from './gql';

const List = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));

  const [cancelTelephoneRoomVisitorMulakaats] = useMutation(
    CANCEL_TELEPHONE_ROOM_VISITOR_MULAKAATS
  );
  const { data, loading, refetch } = useQuery(
    PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS,
    {
      variables: {
        filter: {
          startDate: selectedDate,
          endDate: selectedDate,
          pageIndex: pageIndex.toString(),
          pageSize: pageSize.toString(),
        },
      },
    }
  );

  const handleCancelMulakaats = () => {
    Modal.confirm({
      title: 'Are you sure you want to cancel all Mulakaats for this day?',
      onOk() {
        cancelTelephoneRoomVisitorMulakaats({
          variables: { mulakaatDate: selectedDate },
        })
          .then(() => {
            refetch();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      },
      onCancel() {},
    });
  };

  const onPaginationChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const handleDayChange = value => {
    setSelectedDate(value);
    refetch();
  };

  const handleDayGoBack = () => {
    setSelectedDate(selectedDate.clone().subtract(1, 'day'));
    refetch();
  };

  const handleDayGoForward = () => {
    setSelectedDate(selectedDate.clone().add(1, 'day'));
    refetch();
  };

  const getColumns = () => {
    const columns = [
      {
        title: 'Name',
        key: 'visitor.name',
        render: (text, record) => <VisitorName visitor={record.visitor} />,
      },
      {
        title: 'CNIC Number',
        key: 'visitor.cnicNumber',
        dataIndex: 'visitor.cnicNumber',
      },
      {
        title: 'Mobile No.',
        key: 'visitor.contactNumber1',
        dataIndex: 'visitor.contactNumber1',
      },
      {
        title: 'City / Country',
        key: 'cityCountry',
        render: (text, record) => {
          const { visitor } = record;
          return `${visitor.city}, ${visitor.country}`;
        },
      },
      {
        key: 'cancelled',
        render: (text, record) => {
          const { cancelledDate } = record;
          return cancelledDate ? 'Cancelled' : '';
        },
      },
    ];

    return columns;
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Button
          type="primary"
          shape="circle"
          icon="left"
          onClick={handleDayGoBack}
        />
        &nbsp;&nbsp;
        <DatePicker
          allowClear={false}
          format="DD MMM, YYYY"
          onChange={handleDayChange}
          value={selectedDate}
        />
        &nbsp;&nbsp;
        <Button
          type="primary"
          shape="circle"
          icon="right"
          onClick={handleDayGoForward}
        />
      </div>
      <div>
        <Button
          size="large"
          type="secondary"
          icon="sync"
          onClick={() => {
            refetch();
          }}
        >
          Reload
        </Button>
        &nbsp;&nbsp;
        <Button
          size="large"
          type="primary"
          icon="delete"
          onClick={handleCancelMulakaats}
        >
          Cancel Mulakaats
        </Button>
      </div>
    </div>
  );

  if (loading) return null;
  const { pagedTelephoneRoomVisitorMulakaats } = data;
  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 20;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedTelephoneRoomVisitorMulakaats.data}
      columns={getColumns()}
      title={getTableHeader}
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
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationChange}
          total={pagedTelephoneRoomVisitorMulakaats.totalResults}
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
