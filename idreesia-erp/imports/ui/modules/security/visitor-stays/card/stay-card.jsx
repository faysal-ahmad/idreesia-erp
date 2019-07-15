import React from "react";
import PropTypes from "prop-types";
import Barcode from "react-barcode";
import moment from "moment";
import { Card } from "antd";

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

const StayCard = ({ visitor, visitorStay }) => {
  const title = visitor.criminalRecord
    ? "Night Stay Card - (D)"
    : "Night Stay Card";

  return (
    <Card title={title} style={ConatinerStyle}>
      <h2>Personal Information</h2>
      <div>
        <b>Name:</b> {visitor.name}
      </div>
      <div>
        <b>S/O:</b> {visitor.parentName}
      </div>
      <div>
        <b>R/O:</b> {visitor.referenceName}
      </div>
      <div>
        <b>City:</b> {visitor.city}
      </div>
      <div>
        <b>CNIC:</b> {visitor.cnicNumber}
      </div>
      <div>
        <b>Phone:</b> {visitor.contactNumber1}
      </div>
      <h2>Stay Time</h2>
      <div>
        <b>From:</b>{" "}
        {moment(Number(visitorStay.fromDate)).format("DD MMMM, YYYY")}
      </div>
      <div>
        <b>To:</b> {moment(Number(visitorStay.toDate)).format("DD MMMM, YYYY")}
      </div>
      <div>
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
