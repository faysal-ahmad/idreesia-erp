import React, { Component, type CSSProperties } from 'react';
import Barcode from 'react-barcode';
import dayjs from 'dayjs';
import { find } from 'meteor/idreesia-common/utilities/lodash';

import { Card } from 'antd';
import { StayReasons } from 'meteor/idreesia-common/constants/security';

const BarcodeView = Barcode as any;

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 5,
};

const HeadStyle: CSSProperties = {
  color: 'black',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center',
};

const BodyStyle: CSSProperties = {
  paddingTop: '0px',
};

const FooterStyle: CSSProperties = {
  color: 'black',
  fontSize: '12px',
  textAlign: 'center',
  paddingTop: '4px',
};

interface Visitor {
  name?: string | null;
  parentName?: string | null;
  referenceName?: string | null;
  city?: string | null;
  cnicNumber?: string | null;
  contactNumber1?: string | null;
  criminalRecord?: string | null;
}

interface VisitorStay {
  _id?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  stayReason?: string | null;
  stayAllowedBy?: string | null;
  dutyName?: string | null;
  shiftName?: string | null;
}

interface StayCardProps {
  visitor: Visitor;
  visitorStay: VisitorStay;
}

export default class StayCard extends Component<StayCardProps> {
  getDutyDetails = () => {
    const { visitorStay } = this.props;

    let dutyDetails: React.ReactNode[] = [];
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
      ? 'Night Stay Card - (D)'
      : 'Night Stay Card';

    const dutyDetails = this.getDutyDetails();
    const reason = visitorStay.stayReason
      ? find(StayReasons, ({ _id }) => _id === visitorStay.stayReason)
      : null;
    const reasonText = reason ? reason.name : '';
    const stayAllowedBy = visitorStay.stayAllowedBy ?? '';
    const fromDate = dayjs(Number(visitorStay.fromDate)).format('DD MMM, YYYY');
    const toDate = dayjs(Number(visitorStay.toDate)).format('DD MMM, YYYY');

    return (
      <Card
        size="small"
        title={title}
        styles={{ header: HeadStyle, body: BodyStyle }}
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
        {fromDate === toDate ? (
          <div className="stay_card_item">
            <b>Date:</b>&nbsp;{fromDate}
          </div>
        ) : (
          <div className="stay_card_item">
            <b>Dates:</b>&nbsp;{fromDate}&nbsp;-&nbsp;{toDate}
          </div>
        )}
        {reasonText ? (
          <div className="stay_card_item">
            <b>Reason:</b> {reasonText}
          </div>
        ) : null}
        {stayAllowedBy ? (
          <div className="stay_card_item">
            <b>Allowed By:</b> {stayAllowedBy}
          </div>
        ) : null}
        {dutyDetails}
        <div className="stay_card_item">
          <BarcodeView value={visitorStay._id ?? ''} {...barcodeOptions} />
        </div>
        <div style={FooterStyle}>
          381 A-Block, Shah Rukn-e-Alam Colony, Multan<br />
          Ph: 061-111-111-381
        </div>
      </Card>
    );
  }
}
