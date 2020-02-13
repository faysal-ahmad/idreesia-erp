import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { Table, Pagination } from '/imports/ui/controls';

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

const KarkunAttendancesList = ({
  pagedAttendances,
  pageIndex,
  pageSize,
  onPageParamsChange,
}) => {
  const { attendance, totalResults } = pagedAttendances;

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
          onChange={onPageParamsChange}
          onShowSizeChange={onPageParamsChange}
          total={totalResults}
        />
      )}
    />
  );
};

KarkunAttendancesList.propTypes = {
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  onPageParamsChange: PropTypes.func,

  pagedAttendances: PropTypes.shape({
    totalResults: PropTypes.number,
    attendance: PropTypes.array,
  }),
};

export default KarkunAttendancesList;
