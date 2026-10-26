import React, { useRef } from 'react';
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
import {
  SHEET_PARAM_NAMES,
  useCardKarkuns,
  type SheetParams,
} from '../use-sheet-rows';

interface ContainerProps {
  history: History;
  location: Location;
}

const CardsContainer = ({ history, location }: ContainerProps) => {
  const meetingCardsRef = useRef<any>(null);
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: [...SHEET_PARAM_NAMES, 'karkunIds', 'cardType'],
  });
  useBreadcrumbs(['HR', 'Attendance Report', 'Meeting Cards']);

  const sheetParams = queryParams as SheetParams & { karkunIds?: string };
  const { karkuns, loading } = useCardKarkuns(sheetParams);

  if (loading) return null;

  const { cardType } = queryParams;
  if (!cardType) return null;


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
        month={sheetParams.selectedMonth}
        karkuns={karkuns}
      />
    </>
  );
};

export default CardsContainer;
