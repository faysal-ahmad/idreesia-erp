import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';

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

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Button, Divider, Input, Select } from '/imports/ui/controls';
import Cards from './cards';

const CardHeadings = ['لنگر شریف تقسیم', 'گوشت تقسیم'];

const CardsContainer = ({
  attendanceLoading,
  attendanceByBarcodeIds,
  history,
}) => {
  const [cardHeading, setCardHeading] = useState(CardHeadings[0]);
  const [cardSubHeading, setCardSubHeading] = useState(null);
  const meetingCardsRef = useRef(null);
  if (attendanceLoading) return null;

  const cardHeadingSelector = (
    <Select
      style={{ width: '200px' }}
      defaultValue={cardHeading}
      allowClear={false}
      onChange={value => {
        setCardHeading(value);
      }}
    >
      {CardHeadings.map((heading, index) => (
        <Select.Option key={index} value={heading}>
          {heading}
        </Select.Option>
      ))}
    </Select>
  );

  const cardSubHeadingInput = (
    <Input
      placeholder="Sub Heading"
      onChange={event => {
        setCardSubHeading(event.target.value);
      }}
    />
  );

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
            content={() => meetingCardsRef.current}
            trigger={() => (
              <Button size="large" type="primary" icon="printer">
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
          {cardHeadingSelector}
          {cardSubHeadingInput}
        </div>
      </div>
      <Divider />
      <Cards
        ref={meetingCardsRef}
        cardHeading={cardHeading}
        cardSubHeading={cardSubHeading}
        attendanceByBarcodeIds={attendanceByBarcodeIds}
      />
    </>
  );
};

CardsContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object,

  attendanceLoading: PropTypes.bool,
  attendanceByBarcodeIds: PropTypes.array,
};

const attendanceByBarcodeIdsQuery = gql`
  query attendanceByBarcodeIds($barcodeIds: String!) {
    attendanceByBarcodeIds(barcodeIds: $barcodeIds) {
      _id
      karkunId
      month
      meetingCardBarcodeId
      karkun {
        _id
        name
        image {
          _id
          data
        }
      }
    }
  }
`;

export default flowRight(
  WithQueryParams(),
  graphql(attendanceByBarcodeIdsQuery, {
    props: ({ data }) => ({ attendanceLoading: data.loading, ...data }),
    options: ({ queryParams: { barcodeIds } }) => ({
      variables: { barcodeIds },
    }),
  }),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'Mehfil Cards'])
)(CardsContainer);
