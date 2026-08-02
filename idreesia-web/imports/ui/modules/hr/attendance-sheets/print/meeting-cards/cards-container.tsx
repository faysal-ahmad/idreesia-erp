import React, { useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { type History } from 'history';
import { type Location } from 'history';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import Cards from './cards';
import { ATTENDANCE_BY_BARCODE_IDS } from '../../gql';

interface ContainerProps {
  history: History;
  location: Location;
}

const CardsContainer = ({ history, location }: ContainerProps) => {
  const meetingCardsRef = useRef<any>(null);
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['barcodeIds', 'cardType'],
  });
  useBreadcrumbs(['HR', 'Attendance Sheets', 'Meeting Cards']);

  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_IDS, {
    variables: { barcodeIds: queryParams.barcodeIds as string },
  });

  if (loading) return null;

  const { cardType } = queryParams;
  if (!cardType) return null;

  const attendanceByBarcodeIds = (data?.attendanceByBarcodeIds ?? []).filter(
    row => row != null
  );

  return (
    <>
      <ReactToPrint
        content={() => meetingCardsRef.current}
        trigger={() => (
          <Button size="large" type="primary" icon={<PrinterOutlined />}>
            Print Cards
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
      <Cards
        ref={meetingCardsRef}
        cardType={cardType as string}
        attendanceByBarcodeIds={attendanceByBarcodeIds}
      />
    </>
  );
};

export default CardsContainer;
