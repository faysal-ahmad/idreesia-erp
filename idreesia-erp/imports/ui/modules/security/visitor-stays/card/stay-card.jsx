import React from "react";
import PropTypes from "prop-types";
import Barcode from "react-barcode";
import moment from "moment";
import { Card } from "antd";
import { find } from "lodash";

import StayReasons from "/imports/ui/modules/security/common/constants/stay-reasons";

const barcodeOptions = {
  width: 1,
  height: 20,
  format: "CODE128B",
  displayValue: false,
  background: "#ffffff",
  lineColor: "#000000",
  margin: 5,
};

const ConatinerStyle = {
  display: "flex",
  flexFlow: "column nowrap",
  justifyContent: "flex-start",
  width: "340px",
};

const HeadStyle = {
  fontSize: "24px",
  fontWeight: "bold",
};

const StayCard = ({ visitor, visitorStay }) => {
  const title = visitor.criminalRecord
    ? "Night Stay Card - (D)"
    : "Night Stay Card";

  const reason = visitorStay.stayReason
    ? find(StayReasons, ({ _id }) => _id === visitorStay.stayReason)
    : null;
  const reasonText = reason ? reason.name : "";

  let dutyDetails = [];
  if (visitorStay.dutyName) {
    dutyDetails = [
      <h2 className="stay_card_section" key="dutyHeader">
        Duty Details
      </h2>,
      <div className="stay_card_item" key="dutyName">
        <b>Duty:</b>
        {` ${visitorStay.dutyName}`}
      </div>,
    ];

    if (visitorStay.shiftName) {
      dutyDetails.push(
        <div className="stay_card_item" key="shiftName">
          <b>Shift:</b>
          {` ${visitorStay.shiftName}`}
        </div>
      );
    }
  }

  return (
    <Card title={title} style={ConatinerStyle} headStyle={HeadStyle}>
      <h2 className="stay_card_section">Personal Information</h2>
      <div className="stay_card_item">
        <b>Name:</b> {visitor.name}
      </div>
      <div className="stay_card_item">
        <b>S/O:</b> {visitor.parentName}
      </div>
      <div className="stay_card_item">
        <b>R/O:</b> {visitor.referenceName}
      </div>
      <div className="stay_card_item">
        <b>City:</b> {visitor.city}
      </div>
      <div className="stay_card_item">
        <b>CNIC:</b> {visitor.cnicNumber}
      </div>
      <div className="stay_card_item">
        <b>Phone:</b> {visitor.contactNumber1}
      </div>
      <h2 className="stay_card_section">Stay Details</h2>
      <div className="stay_card_item">
        <b>From:</b>{" "}
        {moment(Number(visitorStay.fromDate)).format("DD MMMM, YYYY")}
      </div>
      <div className="stay_card_item">
        <b>To:</b> {moment(Number(visitorStay.toDate)).format("DD MMMM, YYYY")}
      </div>
      <div className="stay_card_item">
        <b>Reason:</b> {reasonText}
      </div>
      {dutyDetails}
      <div className="stay_card_item">
        <Barcode value={visitorStay._id} {...barcodeOptions} />
      </div>
    </Card>
  );
};

StayCard.propTypes = {
  visitor: PropTypes.object,
  visitorStay: PropTypes.object,
};

export default StayCard;
