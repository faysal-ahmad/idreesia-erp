import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Button, Divider } from '/imports/ui/controls';
import MeetingCards from './meeting-cards';

const MeetingCardsContainer = ({
  attendanceLoading,
  attendanceByBarcodeIds,
  history,
}) => {
  const meetingCardsRef = useRef(null);
  if (attendanceLoading) return null;

  return (
    <>
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
      <Divider />
      <MeetingCards
        ref={meetingCardsRef}
        attendanceByBarcodeIds={attendanceByBarcodeIds}
      />
    </>
  );
};

MeetingCardsContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  attendanceLoading: PropTypes.bool,
  attendanceByBarcodeIds: PropTypes.array,
};

const attendanceByBarcodeIdsQuery = gql`
  query attendanceByBarcodeIds($barcodeIds: String!) {
    attendanceByBarcodeIds(barcodeIds: $barcodeIds) {
      _id
      karkunId
      month
      dutyId
      shiftId
      absentCount
      presentCount
      percentage
      meetingCardBarcodeId
      karkun {
        _id
        name
        image {
          _id
          data
        }
      }
      job {
        _id
        name
      }
      duty {
        _id
        name
      }
      shift {
        _id
        name
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
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'Meeting Cards'])
)(MeetingCardsContainer);
