import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";
import ReactToPrint from "react-to-print";

import { Button, Divider } from "/imports/ui/controls";
import { WithBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
import MeetingCards from "./meeting-cards";

class MeetingCardsContainer extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    attendanceLoading: PropTypes.bool,
    attendanceByBarcodeIds: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
  }

  render() {
    const { attendanceLoading, attendanceByBarcodeIds } = this.props;
    if (attendanceLoading) return null;

    return (
      <Fragment>
        <ReactToPrint
          content={() => this.componentRef.current}
          trigger={() => (
            <Button type="primary" icon="printer">
              Print Cards
            </Button>
          )}
        />
        <Divider />
        <MeetingCards
          ref={this.componentRef}
          attendanceByBarcodeIds={attendanceByBarcodeIds}
        />
      </Fragment>
    );
  }
}

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
        imageId
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
  WithBreadcrumbs(["HR", "Attendance Sheets", "Meeting Cards"])
)(MeetingCardsContainer);
