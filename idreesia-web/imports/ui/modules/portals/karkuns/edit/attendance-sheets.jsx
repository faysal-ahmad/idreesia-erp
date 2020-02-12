import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';

import { Table, Pagination } from '/imports/ui/controls';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

import { PAGED_PORTAL_ATTENDANCE_BY_KARKUN } from '../gql';

const getQueryString = (pageIndex, pageSize) =>
  `?pageIndex=${pageIndex}&pageSize=${pageSize}`;

const columns = [
  {
    title: 'Month',
    dataIndex: 'month',
    key: 'month',
    render: text => {
      const date = moment(`01-${text}`, Formats.DATE_FORMAT);
      return date.format('MMM, YYYY');
    },
  },
  {
    title: 'Present',
    dataIndex: 'presentCount',
    key: 'presentCount',
  },
  {
    title: 'Late',
    dataIndex: 'lateCount',
    key: 'lateCount',
  },
  {
    title: 'Absent',
    dataIndex: 'absentCount',
    key: 'absentCount',
  },
  {
    title: '%age',
    dataIndex: 'percentage',
    key: 'percentage',
    render: text => `${text}%`,
  },
];

const AttendanceSheets = ({ portalId, karkunId }) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(PAGED_PORTAL_ATTENDANCE_BY_KARKUN, {
    variables: {
      portalId,
      karkunId,
      queryString: getQueryString(pageIndex, pageSize),
    },
  });

  const onChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const onShowSizeChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  if (loading) return null;
  const {
    pagedPortalAttendanceByKarkun: { attendance, totalResults },
  } = data;

  return (
    <Table
      rowKey="_id"
      size="small"
      columns={columns}
      dataSource={attendance}
      pagination={false}
      bordered
      footer={() => (
        <Pagination
          current={pageIndex + 1}
          pageSize={pageSize}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          total={totalResults}
        />
      )}
    />
  );
};

AttendanceSheets.propTypes = {
  portalId: PropTypes.string,
  karkunId: PropTypes.string,
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default AttendanceSheets;
