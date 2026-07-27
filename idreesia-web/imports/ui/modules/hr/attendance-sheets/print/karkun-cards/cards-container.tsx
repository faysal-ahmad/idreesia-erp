import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import {
  AutoComplete,
  Button,
  Checkbox,
  Divider,
  Input,
} from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import Cards from './cards';

import { ATTENDANCE_BY_BARCODE_IDS } from '../../gql';

const CardHeadings = ['لنگر شریف تقسیم', 'گوشت تقسیم', 'پارکنگ'];

const ControlsContainer = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

const InputControlsContainer = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'flex-start',
};

const PrintControl = ReactToPrint as any;
const AntAutoComplete = AutoComplete as any;
const AntInput = Input as any;
const AntCheckbox = Checkbox as any;
const PrintButton = Button as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const CardsView = Cards as any;
interface HistoryLike { goBack(): void; }
interface ContainerProps { history: HistoryLike; queryParams: Record<string, string | undefined>; }
interface QueryData { attendanceByBarcodeIds?: unknown[]; }

const CardsContainer = ({
  history,
  queryParams,
}: ContainerProps) => {
  const [cardHeading, setCardHeading] = useState(CardHeadings[0]);
  const [cardSubHeading, setCardSubHeading] = useState<string | null>(null);
  const [showDutyInfo, setShowDutyInfo] = useState(false);
  const meetingCardsRef = useRef<any>(null);
  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_IDS as any, {
    variables: { barcodeIds: queryParams.barcodeIds },
  });

  if (loading) return null;

  const cardHeadingInput = (
    <AntAutoComplete
      style={{ width: '200px' }}
      defaultValue={cardHeading}
      dataSource={CardHeadings}
      allowClear={false}
      onChange={(value: string) => {
        setCardHeading(value);
      }}
    />
  );

  const cardSubHeadingInput = (
    <AntInput
      placeholder="Sub Heading"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setCardSubHeading(event.target.value);
      }}
    />
  );

  const cardShowDutiesInput = (
    <AntCheckbox
      checked={showDutyInfo}
      onChange={(e: any) => setShowDutyInfo(e.target.checked)}
    >
      Show Duty Info
    </AntCheckbox>
  );

  return (
    <>
      <div style={ControlsContainer as any}>
        <div>
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
        </div>
        <div style={InputControlsContainer as any}>
          {cardHeadingInput}
          {cardSubHeadingInput}
          {cardShowDutiesInput}
        </div>
      </div>
      <AntDivider />
      <CardsView
        ref={meetingCardsRef}
        cardHeading={cardHeading}
        cardSubHeading={cardSubHeading}
        showDutyInfo={showDutyInfo}
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
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'Karkun Cards'])
)(CardsContainer as any);
