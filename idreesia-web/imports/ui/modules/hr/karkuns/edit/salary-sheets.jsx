import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useQuery } from '@apollo/react-hooks';

import { Formats } from 'meteor/idreesia-common/constants';
import { Table, Pagination } from '/imports/ui/controls';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

import { PAGED_SALARIES_BY_KARKUN } from '../gql';

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
const getQueryString = (karkunId, pageIndex, pageSize) =>
  `?karkunId=${karkunId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
const SalarySheets = ({ karkunId }) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(PAGED_SALARIES_BY_KARKUN, {
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
      dataSource={data.pagedSalariesByKarkun.salaries}
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
          total={data.pagedSalariesByKarkun.totalResults}
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
