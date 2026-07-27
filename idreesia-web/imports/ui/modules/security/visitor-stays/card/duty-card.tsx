import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import dayjs from 'dayjs';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { Col, Row } from 'antd';

const BarcodeControl = Barcode as any;
const AntCol = Col as any;
const AntRow = Row as any;

const barcodeOptions = {
  width: 0.9,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 1,
};

interface Visitor {
  name: string;
  parentName?: string;
  city?: string;
  country?: string;
  image?: { data?: string } | null;
}

interface VisitorStay {
  _id: string;
  fromDate: string | number;
  toDate: string | number;
  stayReason?: string;
}

interface DutyCardProps {
  visitor: Visitor;
  visitorStay: VisitorStay;
}

export default class DutyCard extends Component<DutyCardProps> {
  static propTypes = {
    visitor: PropTypes.object,
    visitorStay: PropTypes.object,
  };

  getVisitorImage = () => {
    const { visitor } = this.props;
    const visitorImage = visitor.image ? (
      <img
        src={`data:image/jpeg;base64,${visitor.image.data}`}
        style={{ height: 'auto', width: '100%' }}
        alt={visitor.name}
      />
    ) : null;

    return visitorImage;
  };

  render() {
    const { visitor, visitorStay } = this.props;
    const reason = visitorStay.stayReason
      ? find(StayReasons, ({ _id }) => _id === visitorStay.stayReason)
      : null;

    if (!reason) return null;

    const fromDate = dayjs(Number(visitorStay.fromDate)).format('DD-MMM-YY');
    const toDate = dayjs(Number(visitorStay.toDate)).format('DD-MMM-YY');
    const title = reason.name;
    const subTitle = fromDate === toDate ? fromDate : `${fromDate} to ${toDate}`;
    const visitorImage = this.getVisitorImage();

    return (
      <div className="visitor-duty-card-print-view">
        <div className="visitor_duty_card">
          <AntRow justify="center">
            <AntCol>
              <div className="visitor_duty_card_heading">{title}</div>
              <div className="visitor_duty_card_subheading">{subTitle}</div>
            </AntCol>
          </AntRow>
          <AntRow>
            <AntCol>
              <div className="visitor_duty_card_content">
                <div className="visitor_duty_card_pic">{visitorImage}</div>
                <div>
                  <div className="visitor_duty_card_item">
                    <b>Name: </b>
                    {visitor.name}
                  </div>
                  <div className="visitor_duty_card_item">
                    <b>S/O: </b> {visitor.parentName}
                  </div>
                  <div className="visitor_duty_card_item">
                    <b>City: </b>
                    {visitor.city}, {visitor.country}
                  </div>
                  <div className="visitor_duty_card_item">
                    <BarcodeControl value={visitorStay._id} {...barcodeOptions} />
                  </div>
                </div>
              </div>
            </AntCol>
          </AntRow>
        </div>
      </div>
    );
  }
}
