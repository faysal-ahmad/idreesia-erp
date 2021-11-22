import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import SalaryReceipts from './salary-receipts';

const SalaryReceiptsContainer = ({
  salariesLoading,
  salariesByIds,
  history,
}) => {
  const salaryReceiptsRef = useRef(null);
  if (salariesLoading) return null;

  return (
    <>
      <ReactToPrint
        content={() => salaryReceiptsRef.current}
        trigger={() => (
          <Button size="large" type="primary" icon={<PrinterOutlined />}>
            Print Receipts
          </Button>
        )}
      />
      &nbsp;
      <Button
        size="large"
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        Back
      </Button>
      <Divider />
      <SalaryReceipts ref={salaryReceiptsRef} salariesByIds={salariesByIds} />
    </>
  );
};

SalaryReceiptsContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  salariesLoading: PropTypes.bool,
  salariesByIds: PropTypes.array,
};

const salariesByIdsQuery = gql`
  query salariesByIds($ids: String!) {
    salariesByIds(ids: $ids) {
      _id
      karkunId
      month
      jobId
      salary
      openingLoan
      loanDeduction
      newLoan
      closingLoan
      otherDeduction
      arrears
      netPayment
      karkun {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        image {
          _id
          data
        }
      }
      job {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  WithQueryParams(),
  graphql(salariesByIdsQuery, {
    props: ({ data }) => ({ salariesLoading: data.loading, ...data }),
    options: ({ queryParams: { ids } }) => ({
      variables: { ids },
    }),
  }),
  WithBreadcrumbs(['HR', 'Salary Sheets', 'Salary Receipts'])
)(SalaryReceiptsContainer);
