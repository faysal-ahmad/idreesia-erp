import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';

import { Formats } from 'meteor/idreesia-common/constants';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { Table, Pagination } from 'antd';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

import { PAGED_SALARIES_BY_KARKUN } from '../gql';

const AntTable = Table as any;
const AntPagination = Pagination as any;
type AnyRecord = Record<string, any>;
interface PagedData { totalResults: number; salaries: AnyRecord[]; }
interface QueryData { pagedSalariesByKarkun?: PagedData | null; }
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
    title: 'Salary',
    dataIndex: 'salary',
    key: 'salary',
  },
  {
    title: 'Rashan',
    dataIndex: 'rashanMadad',
    key: 'rashanMadad',
  },
  {
    title: 'Loan',
    children: [
      {
        title: 'Opening',
        dataIndex: 'openingLoan',
        key: 'openingLoan',
      },
      {
        title: 'Deduction',
        dataIndex: 'loanDeduction',
        key: 'loanDeduction',
      },
      {
        title: 'New',
        dataIndex: 'newLoan',
        key: 'newLoan',
      },
      {
        title: 'Closing',
        dataIndex: 'closingLoan',
        key: 'closingLoan',
      },
    ],
  },
  {
    title: 'Other Deduction',
    dataIndex: 'otherDeduction',
    key: 'otherDeduction',
  },
  {
    title: 'Arrears',
    dataIndex: 'arrears',
    key: 'arrears',
  },
  {
    title: 'Net Payment',
    dataIndex: 'netPayment',
    key: 'netPayment',
  },
];
const getQueryString = (karkunId: string | null | undefined, pageIndex: number, pageSize: number) =>
  `?karkunId=${karkunId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
const SalarySheets = ({ karkunId }: Props) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(PAGED_SALARIES_BY_KARKUN as any, {
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
      dataSource={((data ?? {}) as QueryData).pagedSalariesByKarkun?.salaries ?? []}
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
          total={((data ?? {}) as QueryData).pagedSalariesByKarkun?.totalResults ?? 0}
        />
      )}
    />
  );
};

export default SalarySheets;

SalarySheets.propTypes = {
  karkunId: PropTypes.string,
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  loading: PropTypes.bool,
  pagedSalariesByKarkun: PropTypes.shape({
    totalResults: PropTypes.number,
    salaries: PropTypes.array,
  }),
};
