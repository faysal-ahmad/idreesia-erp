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

const CardsContainer = ({ history, queryParams }) => {
  const meetingCardsRef = useRef(null);
  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_IDS, {
    variables: { barcodeIds: queryParams.barcodeIds },
  });

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
        cardType={cardType}
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
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'Meeting Cards'])
)(CardsContainer);
