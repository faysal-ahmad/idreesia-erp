import React, { Component } from "react";
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

const HeadStyle = {
  color: "black",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
};

const BodyStyle = {
  paddingTop: "0px",
};

const FooterStyle = {
  color: "black",
  fontSize: "12px",
  textAlign: "center",
  paddingTop: "4px",
};

export default class StayCard extends Component {
  static propTypes = {
    visitor: PropTypes.object,
    visitorStay: PropTypes.object,
  };

  getDutyDetails = () => {
    const { visitorStay } = this.props;

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

    return dutyDetails;
  };

  render() {
    const { visitor, visitorStay } = this.props;
    const title = visitor.criminalRecord
      ? "Night Stay Card - (D)"
      : "Night Stay Card";

    const dutyDetails = this.getDutyDetails();
    const reason = visitorStay.stayReason
      ? find(StayReasons, ({ _id }) => _id === visitorStay.stayReason)
      : null;
    const reasonText = reason ? reason.name : "";

    return (
      <Card
        size="small"
        title={title}
        headStyle={HeadStyle}
        bodyStyle={BodyStyle}
      >
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
          <b>To:</b>{" "}
          {moment(Number(visitorStay.toDate)).format("DD MMMM, YYYY")}
        </div>
        {reasonText ? (
          <div className="stay_card_item">
            <b>Reason:</b> {reasonText}
          </div>
        ) : null}
        {dutyDetails}
        <div className="stay_card_item">
          <Barcode value={visitorStay._id} {...barcodeOptions} />
        </div>
        <div style={FooterStyle}>
          381 A-Block, Shah Rukn-e-Alam Colony, Multan<br />
          Ph: 061-111-111-381
        </div>
      </Card>
    );
  }
}
