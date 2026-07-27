import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';

import Cards from './cards';
import { ATTENDANCE_BY_BARCODE_IDS } from '../../gql';

const PrintControl = ReactToPrint as any;
const PrintButton = Button as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const CardsView = Cards as any;
interface HistoryLike { goBack(): void; }
interface ContainerProps { history: HistoryLike; queryParams: Record<string, string | undefined>; }
interface QueryData { attendanceByBarcodeIds?: unknown[]; }

const CardsContainer = ({ history, queryParams }: ContainerProps) => {
  const meetingCardsRef = useRef<any>(null);
  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_IDS as any, {
    variables: { barcodeIds: queryParams.barcodeIds },
  });

  if (loading) return null;

  const { cardType } = queryParams;
  if (!cardType) return null;

  return (
    <>
      <PrintControl
        content={() => meetingCardsRef.current}
        trigger={() => (
          <PrintButton size="large" type="primary" icon={<AntPrinterOutlined />}>
            Print Cards
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
      <CardsView
        ref={meetingCardsRef}
        cardType={cardType}
        attendanceByBarcodeIds={
          data ? (data as QueryData).attendanceByBarcodeIds : []
        }
      />
    </>
  );
};

CardsContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object,
};

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'Meeting Cards'])
)(CardsContainer as any);
