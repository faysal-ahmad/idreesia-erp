import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';

import { Formats } from 'meteor/idreesia-common/constants';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';

import { Table, Pagination } from 'antd';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';
import type { PagedAttendanceByHrKarkunQuery } from 'meteor/idreesia-common/types/client-operations';

import { PAGED_ATTENDANCE_BY_KARKUN } from '../gql';

const getQueryString = (karkunId: string, pageIndex: number, pageSize: number) =>
  `?karkunId=${karkunId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

type AttendanceRow = NonNullable<
  NonNullable<NonNullable<PagedAttendanceByHrKarkunQuery['pagedAttendanceByKarkun']>['data']>[number]
>;
interface Props { karkunId: string; }

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
    render: (_text: unknown, record: AttendanceRow) => {
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
  const { data, loading } = useQuery(PAGED_ATTENDANCE_BY_KARKUN, {
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

  const paged = data?.pagedAttendanceByKarkun;
  const rows = (paged?.data ?? []).filter((row): row is AttendanceRow => row != null);

  return (
    <Table
      rowKey="_id"
      size="small"
      columns={columns as any}
      dataSource={rows}
      pagination={false}
      bordered
      footer={() => (
        <Pagination
          current={pageIndex + 1}
          pageSize={pageSize}
          showSizeChanger
          showTotal={(total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          total={paged?.totalResults ?? 0}
        />
      )}
    />
  );
};

export default AttendanceSheets;
