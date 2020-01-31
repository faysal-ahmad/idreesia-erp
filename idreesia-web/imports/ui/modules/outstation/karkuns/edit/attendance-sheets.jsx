import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';

import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';

import { Formats } from 'meteor/idreesia-common/constants';

import { Table, Pagination } from '/imports/ui/controls';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

const listQuery = gql`
  query pagedAttendanceByKarkun($queryString: String) {
    pagedAttendanceByKarkun(queryString: $queryString) {
      totalResults
      attendance {
        _id
        dutyId
        shiftId
        jobId
        month
        absentCount
        presentCount
        percentage
        job {
          _id
          name
        }
        duty {
          _id
          name
        }
        shift {
          _id
          name
        }
      }
    }
  }
`;

const getQueryString = (karkunId, pageIndex, pageSize) =>
  `?karkunId=${karkunId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

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
    title: 'Job / Duty / Shift',
    key: 'shift.name',
    render: (text, record) => {
      let name;
      if (record.job) {
        name = record.job.name;
      } else if (record.duty) {
        name = record.duty.name;
        if (record.shift) {
          name = `${name} - ${record.shift.name}`;
        }
      }

      return name;
    },
  },
  {
    title: 'Present',
    dataIndex: 'presentCount',
    key: 'presentCount',
  },
  {
    title: 'Absent',
    dataIndex: 'absentCount',
    key: 'absentCount',
  },
  {
    title: 'Percentage',
    dataIndex: 'percentage',
    key: 'percentage',
    render: text => `${text}%`,
  },
];

const AttendanceSheets = ({ karkunId }) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(listQuery, {
    variables: {
      queryString: getQueryString(karkunId, pageIndex, pageSize),
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

  return (
    <Table
      rowKey="_id"
      size="small"
      columns={columns}
      dataSource={data.pagedAttendanceByKarkun.attendance}
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
          total={data.pagedAttendanceByKarkun.totalResults}
        />
      )}
    />
  );
};

AttendanceSheets.propTypes = {
  karkunId: PropTypes.string,
  setPageParams: PropTypes.func,
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  pagedAttendanceByKarkun: PropTypes.shape({
    totalResults: PropTypes.number,
    attendance: PropTypes.array,
  }),
};

export default AttendanceSheets;
