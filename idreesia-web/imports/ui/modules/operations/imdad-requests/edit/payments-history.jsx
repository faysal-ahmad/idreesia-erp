import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import numeral from 'numeral';
import { useQuery } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Pagination, Table } from '/imports/ui/controls';

import { PAGED_PAYMENTS_FOR_IMDAD_REQUEST } from '../gql';

const PaymentsHistory = ({ requestId }) => {
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');
  const { data, loading } = useQuery(PAGED_PAYMENTS_FOR_IMDAD_REQUEST, {
    variables: {
      imdadRequestId: requestId,
      filter: {
        pageIndex,
        pageSize,
      },
    },
  });

  if (loading) return null;
  const { pagedPaymentsForImdadRequest } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const onPaginationChange = (index, size) => {
    setPageIndex(index.toString());
    setPageSize(size.toString());
  };

  const columns = [
    {
      title: 'Voucher No.',
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      width: 100,
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 150,
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Type',
      key: 'paymentType',
      render: (text, record) => record.paymentType.name,
    },
    {
      title: 'Amount',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      width: 100,
      render: text => numeral(text).format('0,0'),
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={pagedPaymentsForImdadRequest.data}
      columns={columns}
      bordered
      size="small"
      pagination={false}
      footer={() => (
        <Pagination
          defaultCurrent={1}
          defaultPageSize={20}
          current={numPageIndex}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationChange}
          total={pagedPaymentsForImdadRequest.totalResults}
        />
      )}
    />
  );
};

PaymentsHistory.propTypes = {
  requestId: PropTypes.string,
};

export default PaymentsHistory;
