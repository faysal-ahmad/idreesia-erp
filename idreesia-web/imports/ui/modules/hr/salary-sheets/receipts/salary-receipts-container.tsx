import React, { useRef } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { type History } from 'history';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type {
  SalaryReceiptSalariesByIdsQuery,
  SalaryReceiptSalariesByIdsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import SalaryReceipts from './salary-receipts';

const SALARY_RECEIPT_SALARIES_BY_IDS: TypedDocumentNode<
  SalaryReceiptSalariesByIdsQuery,
  SalaryReceiptSalariesByIdsQueryVariables
> = gql`
  query salaryReceiptSalariesByIds($ids: String!) {
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
        sharedData {
          name
          parentName
          cnicNumber
          contactNumber1
          image {
            _id
            data
          }
        }
      }
      job {
        _id
        name
      }
    }
  }
`;

interface ContainerProps {
  history: History;
}

const SalaryReceiptsContainer = ({ history }: ContainerProps) => {
  const { queryParams } = useQueryParams({
    history,
    location: history.location,
    paramNames: ['ids'],
  });
  useBreadcrumbs(['HR', 'Salary Sheets', 'Salary Receipts']);

  const ids = queryParams.ids as string;
  const { data, loading: salariesLoading } = useQuery(SALARY_RECEIPT_SALARIES_BY_IDS, {
    variables: { ids },
  });
  const salaryReceiptsRef = useRef<any>(null);
  if (salariesLoading) return null;

  const salariesByIds = (data?.salariesByIds ?? []).filter(row => row != null);

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
      <SalaryReceipts
        ref={salaryReceiptsRef}
        salariesByIds={salariesByIds}
      />
    </>
  );
};

export default SalaryReceiptsContainer;
