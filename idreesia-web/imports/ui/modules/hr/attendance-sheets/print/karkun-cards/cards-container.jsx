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

const CardsContainer = ({
  history,
  queryParams,
}) => {
  const [cardHeading, setCardHeading] = useState(CardHeadings[0]);
  const [cardSubHeading, setCardSubHeading] = useState(null);
  const [showDutyInfo, setShowDutyInfo] = useState(false);
  const meetingCardsRef = useRef(null);
  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_IDS, {
    variables: { barcodeIds: queryParams.barcodeIds },
  });

  if (loading) return null;

  const cardHeadingInput = (
    <AutoComplete
      style={{ width: '200px' }}
      defaultValue={cardHeading}
      dataSource={CardHeadings}
      allowClear={false}
      onChange={value => {
        setCardHeading(value);
      }}
    />
  );

  const cardSubHeadingInput = (
    <Input
      placeholder="Sub Heading"
      onChange={event => {
        setCardSubHeading(event.target.value);
      }}
    />
  );

  const cardShowDutiesInput = (
    <Checkbox
      checked={showDutyInfo}
      onChange={e => setShowDutyInfo(e.target.checked)}
    >
      Show Duty Info
    </Checkbox>
  );

  return (
    <>
      <div style={ControlsContainer}>
        <div>
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
        </div>
        <div style={InputControlsContainer}>
          {cardHeadingInput}
          {cardSubHeadingInput}
          {cardShowDutiesInput}
        </div>
      </div>
      <Divider />
      <Cards
        ref={meetingCardsRef}
        cardHeading={cardHeading}
        cardSubHeading={cardSubHeading}
        showDutyInfo={showDutyInfo}
        attendanceByBarcodeIds={
          data ? data.attendanceByBarcodeIds : undefined
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
)(CardsContainer);
