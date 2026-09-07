import React, { Component } from 'react';
import Barcode from 'react-barcode';
import dayjs from 'dayjs';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { Col, Row } from 'antd';

const BarcodeView = Barcode as any;

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
  name?: string | null;
  parentName?: string | null;
  city?: string | null;
  country?: string | null;
  imageId?: string | null;
}

interface VisitorStay {
  _id?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  stayReason?: string | null;
}

interface DutyCardProps {
  visitor: Visitor;
  visitorStay: VisitorStay;
}

export default class DutyCard extends Component<DutyCardProps> {
  getVisitorImage = () => {
    const { visitor } = this.props;
    const downloadUrl = getDownloadUrl(visitor.imageId);
    const visitorImage = downloadUrl ? (
      <img
        src={downloadUrl}
        style={{ height: 'auto', width: '100%' }}
        alt={visitor.name ?? 'Visitor'}
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
          <Row justify="center">
            <Col>
              <div className="visitor_duty_card_heading">{title}</div>
              <div className="visitor_duty_card_subheading">{subTitle}</div>
            </Col>
          </Row>
          <Row>
            <Col>
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
                    <BarcodeView value={visitorStay._id ?? ''} {...barcodeOptions} />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
