import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Col, Divider, Row } from '/imports/ui/controls';

import { Item } from './item';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center',
  width: '800px',
  padding: '20px',
  marginBottom: '100px',
};

const HeaderStyle = {
  fontSize: 20,
  border: 'solid',
};

export default class PaymentReceipts extends Component {
  static propTypes = {
    paymentById: PropTypes.object,
  };

  getPaymentReceipt = payment => {
    const formattedDate = moment().format('DD-MM-YYYY h:mm a');
    return (
      <div key={payment._id} className="payment-receipt-print-view">
        <Row type="flex" justify="space-between" style={HeaderStyle}>
          <Col order={1} style={{ marginLeft: '10px' }}>
            {payment.paymentNumber}
          </Col>
          <Col order={2}>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
              Payment Receipt
            </div>
          </Col>
          <Col order={3} style={{ marginRight: '10px' }}>
            <div>
              {moment(Number(payment.paymentDate)).format('DD MMM, YYYY')}
            </div>
          </Col>
        </Row>
        <Row type="flex" justify="start" gutter={10}>
          <Col order={2} style={{ minWidth: '600px' }}>
            <Item label="Received Cash Rs" value={payment.paymentAmount} />
            <Item label="Description" value={payment.description || ''} />
            <Row type="flex">
              <Col order={1} style={{ minWidth: '350px' }}>
                <Item label="Name" value={payment.name} />
              </Col>
              <Col order={2} style={{ minWidth: '350px' }}>
                <Item label="Father Name" value={payment.fatherName} />
              </Col>
            </Row>
            <Row type="flex">
              <Col order={1} style={{ minWidth: '350px' }}>
                <Item label="CNIC" value={payment.cnicNumber || ''} />
              </Col>
              <Col order={2} style={{ minWidth: '350px' }}>
                <Item label="Mobile No." value={payment.contactNumber} />
              </Col>
            </Row>
            <Row type="flex">
              <Col order={1} style={{ minWidth: '350px' }}>
                <Item label="Signature" value="" />
              </Col>
              <Col order={1} style={{ minWidth: '350px' }}>
                <Item label="Approved By" value="" />
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col order={1}>Printed on : {formattedDate}</Col>
        </Row>
      </div>
    );
  };

  render() {
    const { paymentById } = this.props;
    const receiptForPage = this.getPaymentReceipt(paymentById);

    return (
      <div>
        <div style={ContainerStyle}>{receiptForPage}</div>
        <div style={ContainerStyle}>{receiptForPage}</div>
      </div>
    );
  }
}
