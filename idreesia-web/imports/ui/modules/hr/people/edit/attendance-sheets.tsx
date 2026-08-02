import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';

import PropTypes from 'prop-types';

import { Formats } from 'meteor/idreesia-common/constants';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';

import { Table, Pagination } from 'antd';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

import { PAGED_ATTENDANCE_BY_KARKUN } from '../gql';

const getQueryString = (karkunId: string | null | undefined, pageIndex: number, pageSize: number) =>
  `?karkunId=${karkunId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

const AntTable = Table as any;
const AntPagination = Pagination as any;
type AnyRecord = Record<string, any>;
interface PagedData { totalResults: number; data: AnyRecord[]; }
interface QueryData { pagedAttendanceByKarkun?: PagedData | null; }
interface Props { karkunId?: string | null; }

const columns: any[] = [
  {
    title: 'Month',
    dataIndex: 'month',
    key: 'month',
    render: (text: string) => {
      const date = parseDate(`01-${text}`, Formats.DATE_FORMAT);
      return formatDate(date, 'MMM, YYYY');
    },
  },
  {
    title: 'Job / Duty / Shift',
    key: 'shift.name',
    render: (_text: unknown, record: AnyRecord) => {
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
    render: (text: string | number) => `${text}%`,
  },
];

const AttendanceSheets = ({ karkunId }: Props) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(PAGED_ATTENDANCE_BY_KARKUN as any, {
    variables: {
      queryString: getQueryString(karkunId, pageIndex, pageSize),
    },
  });

  const onChange = (index: number, size: number) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const onShowSizeChange = (index: number, size: number) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  if (loading) return null;

  return (
    <AntTable
      rowKey="_id"
      size="small"
      columns={columns as any}
      dataSource={((data ?? {}) as QueryData).pagedAttendanceByKarkun?.data ?? []}
      pagination={false}
      bordered
      footer={() => (
        <AntPagination
          current={pageIndex + 1}
          pageSize={pageSize}
          showSizeChanger
          showTotal={(total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          total={((data ?? {}) as QueryData).pagedAttendanceByKarkun?.totalResults ?? 0}
        />
      )}
    />
  );
};

AttendanceSheets.propTypes = {
  karkunId: PropTypes.string,
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default AttendanceSheets;
