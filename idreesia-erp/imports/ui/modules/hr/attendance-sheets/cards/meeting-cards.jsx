import React, { Component } from "react";
import PropTypes from "prop-types";
import Barcode from "react-barcode";
import moment from "moment";

const barcodeOptions = {
  width: 2,
  height: 119,
  format: "CODE128B",
  displayValue: false,
  background: "#ffffff",
  lineColor: "#000000",
  margin: 5,
};

export default class MeetingCards extends Component {
  static propTypes = {
    attendanceByBarcodeIds: PropTypes.array,
  };

  getCardMarkup(attendance) {
    debugger;
    const month = moment(`01-${attendance.month}`, "DD-MM-YYYY")
      .add(1, "months")
      .startOf("month");

    const headingImageUrl = "/images/heading.png";
    const karkunImageUrl = Meteor.absoluteUrl(
      `download-file?attachmentId=${attendance.karkun.imageId}`
    );

    return (
      <div key={attendance._id} className="card_karkon">
        <div className="heading_card_k">
          <img src={headingImageUrl} width="533" height="234" />
        </div>
        <div className="date_card_k">{month.format("D MMM YYYY")}</div>
        <div className="pic_card_k">
          <img src={karkunImageUrl} width="601" height="423" />
        </div>
        <div className="percentage">{attendance.percentage}%</div>
        <h1 className="name_card_k">{attendance.karkun.name}</h1>
        <p className="k_location">
          {attendance.duty.name} <br />
          {attendance.shift.name}
        </p>
        <div>
          <Barcode
            value={attendance.meetingCardBarcodeId}
            {...barcodeOptions}
          />
        </div>
      </div>
    );
  }

  render() {
    const { attendanceByBarcodeIds } = this.props;
    const cards = attendanceByBarcodeIds.map(attendance =>
      this.getCardMarkup(attendance)
    );

    return <div className="page_print">{cards}</div>;
  }
}
