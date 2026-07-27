import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import RashanReceipts from './rashan-receipts';

const PrintButton = Button as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const PrintControl = ReactToPrint as any;
const ReceiptsView = RashanReceipts as any;
interface HistoryLike { goBack(): void; }
interface ContainerProps { history: HistoryLike; queryParams: { ids: string; }; }
interface QueryData { salariesByIds?: unknown[]; }

const RashanReceiptsContainer = ({
  history,
  queryParams,
}: ContainerProps) => {
  const { data, loading: salariesLoading } = useQuery(salariesByIdsQuery as any, {
    variables: { ids: queryParams.ids },
  });
  const rashanReceiptsRef = useRef<any>(null);
  if (salariesLoading) return null;

  return (
    <>
      <PrintControl
        content={() => rashanReceiptsRef.current}
        trigger={() => (
          <PrintButton size="large" type="primary" icon={<AntPrinterOutlined />}>
            Print Receipts
          </PrintButton>
        )}
      />
      &nbsp;
      <PrintButton
        size="large"
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        Back
      </PrintButton>
      <AntDivider />
      <ReceiptsView
        ref={rashanReceiptsRef}
        salariesByIds={data ? (data as QueryData).salariesByIds : []}
      />
    </>
  );
};

RashanReceiptsContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object,
};

const salariesByIdsQuery = gql`
  query salariesByIds($ids: String!) {
    salariesByIds(ids: $ids) {
      _id
      karkunId
      month
      jobId
      rashanMadad
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
  WithBreadcrumbs(['HR', 'Salary Sheets', 'Rashan Receipts'])
)(RashanReceiptsContainer as any);
