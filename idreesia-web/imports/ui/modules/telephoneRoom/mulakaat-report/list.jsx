import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import {
  Button,
  DatePicker,
  Modal,
  Pagination,
  Table,
  message,
} from '/imports/ui/controls';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { TelephoneRoomSubModulePaths as paths } from '/imports/ui/modules/telephoneRoom';

import {
  CANCEL_TELEPHONE_ROOM_VISITOR_MULAKAATS,
  PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS,
} from './gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['mulakaatDate', 'pageIndex', 'pageSize'],
    paramDefaultValues: {
      mulakaatDate: moment().format(Formats.DATE_FORMAT),
    },
  });

  const [cancelTelephoneRoomVisitorMulakaats] = useMutation(
    CANCEL_TELEPHONE_ROOM_VISITOR_MULAKAATS
  );
  const { data, loading, refetch } = useQuery(
    PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS,
    {
      variables: { filter: queryParams },
    }
  );

  useEffect(() => {
    dispatch(setBreadcrumbs(['Telephone Room', 'Mulakaat Report']));
  }, [location]);

  const handleCancelMulakaats = () => {
    const _mulakaatDate = moment(queryParams.mulakaatDate, Formats.DATE_FORMAT);
    Modal.confirm({
      title: 'Are you sure you want to cancel all Mulakaats for this day?',
      onOk() {
        cancelTelephoneRoomVisitorMulakaats({
          variables: { mulakaatDate: _mulakaatDate },
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

  const { mulakaatDate, pageIndex, pageSize } = queryParams;

  const handlePersonSelect = visitor => {
    history.push(paths.visitorsEditFormPath(visitor._id));
  };

  const onPaginationChange = (index, size) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const handleDayChange = value => {
    setPageParams({
      mulakaatDate: value.format(Formats.DATE_FORMAT),
    });
  };

  const handleDayGoBack = () => {
    const mMulakaatDate = moment(mulakaatDate, Formats.DATE_FORMAT);
    setPageParams({
      mulakaatDate: mMulakaatDate
        .subtract(1, 'day')
        .format(Formats.DATE_FORMAT),
    });
  };

  const handleDayGoForward = () => {
    const mMulakaatDate = moment(mulakaatDate, Formats.DATE_FORMAT);
    setPageParams({
      mulakaatDate: mMulakaatDate.add(1, 'day').format(Formats.DATE_FORMAT),
    });
  };

  const getColumns = () => {
    const columns = [
      {
        title: 'Name',
        key: 'visitor.name',
        render: (text, record) => (
          <PersonName
            person={record.visitor}
            onPersonNameClicked={handlePersonSelect}
          />
        ),
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
          value={moment(mulakaatDate, Formats.DATE_FORMAT)}
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
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

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
