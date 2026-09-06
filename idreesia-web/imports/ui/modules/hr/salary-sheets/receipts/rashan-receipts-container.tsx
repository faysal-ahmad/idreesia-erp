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
  RashanReceiptSalariesByIdsQuery,
  RashanReceiptSalariesByIdsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import RashanReceipts from './rashan-receipts';

const RASHAN_RECEIPT_SALARIES_BY_IDS: TypedDocumentNode<
  RashanReceiptSalariesByIdsQuery,
  RashanReceiptSalariesByIdsQueryVariables
> = gql`
  query rashanReceiptSalariesByIds($ids: String!) {
    salariesByIds(ids: $ids) {
      _id
      karkunId
      month
      jobId
      rashanMadad
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

const RashanReceiptsContainer = ({ history }: ContainerProps) => {
  const { queryParams } = useQueryParams({
    history,
    location: history.location,
    paramNames: ['ids'],
  });
  useBreadcrumbs(['HR', 'Salary Sheets', 'Rashan Receipts']);

  const ids = queryParams.ids as string;
  const { data, loading: salariesLoading } = useQuery(RASHAN_RECEIPT_SALARIES_BY_IDS, {
    variables: { ids },
  });
  const rashanReceiptsRef = useRef<any>(null);
  if (salariesLoading) return null;

  const salariesByIds = (data?.salariesByIds ?? []).filter(row => row != null);

  return (
    <>
      <ReactToPrint
        content={() => rashanReceiptsRef.current}
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
      <RashanReceipts
        ref={rashanReceiptsRef}
        salariesByIds={salariesByIds}
      />
    </>
  );
};

export default RashanReceiptsContainer;
