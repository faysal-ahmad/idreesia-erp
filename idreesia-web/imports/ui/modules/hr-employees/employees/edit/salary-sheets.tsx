import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';

import { Formats } from 'meteor/idreesia-common/constants';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { Table, Pagination } from 'antd';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';
import type { PagedSalariesByKarkunQuery } from 'meteor/idreesia-common/types/client-operations';

import { PAGED_SALARIES_BY_KARKUN } from '../gql';

type SalaryRow = NonNullable<
  NonNullable<NonNullable<PagedSalariesByKarkunQuery['pagedSalariesByKarkun']>['salaries']>[number]
>;
interface Props { employeeId: string; }

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
const getQueryString = (karkunId: string, pageIndex: number, pageSize: number) =>
  `?karkunId=${karkunId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
const SalarySheets = ({ employeeId }: Props) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(PAGED_SALARIES_BY_KARKUN, {
    variables: {
      queryString: getQueryString(employeeId, pageIndex, pageSize),
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

  const paged = data?.pagedSalariesByKarkun;
  const salaries = (paged?.salaries ?? []).filter((row): row is SalaryRow => row != null);

  return (
    <Table
      rowKey="_id"
      size="small"
      columns={columns as any}
      dataSource={salaries}
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

export default SalarySheets;
