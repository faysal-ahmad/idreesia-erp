import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { Button, DatePicker, Pagination, Table } from '/imports/ui/controls';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { TelephoneRoomSubModulePaths as paths } from '/imports/ui/modules/telephoneRoom';

import { PAGED_TELEPHONE_ROOM_VISITORS } from './gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['ehadDate', 'dataSource', 'pageIndex', 'pageSize'],
    paramDefaultValues: {
      ehadDate: moment().format(Formats.DATE_FORMAT),
      dataSource: 'telephone-room',
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Telephone Room', 'New Ehad Report']));
  }, [location]);

  const { data, loading, refetch } = useQuery(PAGED_TELEPHONE_ROOM_VISITORS, {
    variables: {
      filter: queryParams,
    },
  });

  const { ehadDate, pageIndex, pageSize } = queryParams;

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
      ehadDate: value.format(Formats.DATE_FORMAT),
    });
  };

  const handleDayGoBack = () => {
    const mEhadDate = moment(ehadDate, Formats.DATE_FORMAT);
    setPageParams({
      ehadDate: mEhadDate.subtract(1, 'day').format(Formats.DATE_FORMAT),
    });
  };

  const handleDayGoForward = () => {
    const mEhadDate = moment(ehadDate, Formats.DATE_FORMAT);
    setPageParams({
      ehadDate: mEhadDate.add(1, 'day').format(Formats.DATE_FORMAT),
    });
  };

  const getColumns = () => {
    const columns = [
      {
        title: 'Name',
        key: 'name',
        render: (text, record) => (
          <PersonName
            person={record}
            onPersonNameClicked={handlePersonSelect}
          />
        ),
      },
      {
        title: 'Mobile No.',
        key: 'contactNumber1',
        dataIndex: 'contactNumber1',
      },
      {
        title: 'City / Country',
        key: 'cityCountry',
        render: (text, record) => `${record.city}, ${record.country}`,
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
          value={moment(ehadDate, Formats.DATE_FORMAT)}
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
      </div>
    </div>
  );

  if (loading) return null;
  const { pagedTelephoneRoomVisitors } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedTelephoneRoomVisitors.data}
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
          total={pagedTelephoneRoomVisitors.totalResults}
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
