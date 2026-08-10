import React, { useRef, useState, type CSSProperties } from 'react';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import {
  AutoComplete,
  Button,
  Checkbox,
  Divider,
  Input,
  Space,
} from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { type History, type Location } from 'history';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import Cards from './cards';
import { ATTENDANCE_BY_BARCODE_IDS } from '../../gql';

const CardHeadings = ['لنگر شریف تقسیم', 'گوشت تقسیم', 'پارکنگ'];

const ControlsContainer: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
  gap: 16,
};

const InputControlsContainer: CSSProperties = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'flex-start',
  gap: 8,
};

interface ContainerProps {
  history: History;
  location: Location;
}

const CardsContainer = ({ history, location }: ContainerProps) => {
  const karkunCardsRef = useRef<HTMLDivElement | null>(null);
  const [cardHeading, setCardHeading] = useState(CardHeadings[0]);
  const [cardSubHeading, setCardSubHeading] = useState<string | undefined>();
  const [showDutyInfo, setShowDutyInfo] = useState(false);
  const { queryParams } = useQueryParams({
    history,
    location,
    paramNames: ['barcodeIds'],
  });
  useBreadcrumbs(['HR', 'Attendance Sheets', 'Karkun Cards']);

  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_IDS, {
    variables: { barcodeIds: (queryParams.barcodeIds as string) ?? '' },
    skip: !queryParams.barcodeIds,
  });

  if (loading) return null;

  const attendanceByBarcodeIds = (data?.attendanceByBarcodeIds ?? []).filter(
    row => row != null
  );

  return (
    <>
      <div style={ControlsContainer}>
        <Space size={8}>
          <ReactToPrint
            content={() => karkunCardsRef.current}
            trigger={() => (
              <Button size="large" type="primary" icon={<PrinterOutlined />}>
                Print Cards
              </Button>
            )}
          />
          <Button
            size="large"
            type="primary"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </Space>
        <div style={InputControlsContainer}>
          <AutoComplete
            style={{ width: 200 }}
            value={cardHeading}
            options={CardHeadings.map(value => ({ value }))}
            allowClear={false}
            onChange={value => {
              setCardHeading(value);
            }}
          />
          <Input
            placeholder="Sub Heading"
            value={cardSubHeading}
            onChange={event => {
              setCardSubHeading(event.target.value || undefined);
            }}
          />
          <Checkbox
            checked={showDutyInfo}
            onChange={e => setShowDutyInfo(e.target.checked)}
          >
            Show Duty Info
          </Checkbox>
        </div>
      </div>
      <Divider />
      <div ref={karkunCardsRef}>
        <Cards
          cardHeading={cardHeading}
          cardSubHeading={cardSubHeading}
          showDutyInfo={showDutyInfo}
          attendanceByBarcodeIds={attendanceByBarcodeIds}
        />
      </div>
    </>
  );
};

export default CardsContainer;
