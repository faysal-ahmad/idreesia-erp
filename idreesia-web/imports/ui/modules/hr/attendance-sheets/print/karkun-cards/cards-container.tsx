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
  const karkunCardsRef = useRef<any>(null);
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['barcodeIds', 'cardHeading', 'cardSubHeading', 'showDutyInfo'],
  });
  useBreadcrumbs(['HR', 'Attendance Sheets', 'Karkun Cards']);

  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_IDS, {
    variables: { barcodeIds: queryParams.barcodeIds as string },
  });

  if (loading) return null;

  const { cardHeading, cardSubHeading, showDutyInfo } = queryParams;
  if (!cardHeading) return null;

  const attendanceByBarcodeIds = (data?.attendanceByBarcodeIds ?? []).filter(
    row => row != null
  );

  return (
    <>
      <ReactToPrint
        content={() => karkunCardsRef.current}
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
        ref={karkunCardsRef}
        cardHeading={cardHeading as string}
        cardSubHeading={cardSubHeading as string | undefined}
        showDutyInfo={showDutyInfo === 'true'}
        attendanceByBarcodeIds={attendanceByBarcodeIds}
      />
    </>
  );
};

export default CardsContainer;
