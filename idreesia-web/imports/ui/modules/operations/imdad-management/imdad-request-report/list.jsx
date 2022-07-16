import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { Button, DatePicker, Pagination, Table } from 'antd';
import { LeftOutlined, RightOutlined, SyncOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import { PAGED_OPERATIONS_IMDAD_REQUESTS } from './gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['requestDate', 'pageIndex', 'pageSize'],
    paramDefaultValues: {
      requestDate: moment().format(Formats.DATE_FORMAT),
    },
  });

  const { data, loading, refetch } = useQuery(PAGED_OPERATIONS_IMDAD_REQUESTS, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Imdad Request Report']));
  }, [location]);

  const { requestDate, pageIndex, pageSize } = queryParams;

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
      requestDate: value.format(Formats.DATE_FORMAT),
    });
  };

  const handleDayGoBack = () => {
    const mRequestDate = moment(requestDate, Formats.DATE_FORMAT);
    setPageParams({
      requestDate: mRequestDate.subtract(1, 'day').format(Formats.DATE_FORMAT),
    });
  };

  const handleDayGoForward = () => {
    const mRequestDate = moment(requestDate, Formats.DATE_FORMAT);
    setPageParams({
      requestDate: mRequestDate.add(1, 'day').format(Formats.DATE_FORMAT),
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
        dataIndex: ['visitor', 'cnicNumber'],
      },
      {
        title: 'Mobile No.',
        key: 'visitor.contactNumber1',
        dataIndex: ['visitor', 'contactNumber1'],
      },
      {
        title: 'City / Country',
        key: 'cityCountry',
        render: (text, record) => {
          const { visitor } = record;
          return `${visitor.city}, ${visitor.country}`;
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
          icon={<LeftOutlined />}
          onClick={handleDayGoBack}
        />
        &nbsp;&nbsp;
        <DatePicker
          allowClear={false}
          format="DD MMM, YYYY"
          onChange={handleDayChange}
          value={moment(requestDate, Formats.DATE_FORMAT)}
        />
        &nbsp;&nbsp;
        <Button
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
          onClick={handleDayGoForward}
        />
      </div>
      <div>
        <Button
          size="large"
          type="secondary"
          icon={<SyncOutlined />}
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
  const { pagedOperationsImdadRequests } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedOperationsImdadRequests.data}
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
          total={pagedOperationsImdadRequests.totalResults}
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
