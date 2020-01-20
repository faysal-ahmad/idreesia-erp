import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import moment from 'moment';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { Col, Row } from '/imports/ui/controls';

const barcodeOptions = {
  width: 0.9,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 1,
};

export default class DutyCard extends Component {
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

    const fromDate = moment(Number(visitorStay.fromDate)).format('DD-MMM-YY');
    const toDate = moment(Number(visitorStay.toDate)).format('DD-MMM-YY');
    const title = reason.name;
    const subTitle = `${fromDate} to ${toDate}`;
    const visitorImage = this.getVisitorImage();

    return (
      <div className="visitor-duty-card-print-view">
        <div className="visitor_duty_card">
          <Row>
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
                    <Barcode value={visitorStay._id} {...barcodeOptions} />
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
