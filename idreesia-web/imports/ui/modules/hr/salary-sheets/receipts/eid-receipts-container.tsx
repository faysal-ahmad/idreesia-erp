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
  EidReceiptSalariesByIdsQuery,
  EidReceiptSalariesByIdsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import EidReceipts from './eid-receipts';

const EID_RECEIPT_SALARIES_BY_IDS: TypedDocumentNode<
  EidReceiptSalariesByIdsQuery,
  EidReceiptSalariesByIdsQueryVariables
> = gql`
  query eidReceiptSalariesByIds($ids: String!) {
    salariesByIds(ids: $ids) {
      _id
      karkunId
      month
      jobId
      salary
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

const EidReceiptsContainer = ({ history }: ContainerProps) => {
  const { queryParams } = useQueryParams({
    history,
    location: history.location,
    paramNames: ['ids'],
  });
  useBreadcrumbs(['HR', 'Salary Sheets', 'Eid Receipts']);

  const ids = queryParams.ids as string;
  const { data, loading: salariesLoading } = useQuery(EID_RECEIPT_SALARIES_BY_IDS, {
    variables: { ids },
  });
  const eidReceiptsRef = useRef<any>(null);
  if (salariesLoading) return null;

  const salariesByIds = (data?.salariesByIds ?? []).filter(row => row != null);

  return (
    <>
      <ReactToPrint
        content={() => eidReceiptsRef.current}
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
      <EidReceipts
        ref={eidReceiptsRef}
        salariesByIds={salariesByIds}
      />
    </>
  );
};

export default EidReceiptsContainer;
