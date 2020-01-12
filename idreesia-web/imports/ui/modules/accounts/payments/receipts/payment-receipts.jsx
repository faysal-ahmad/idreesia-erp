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

  getPaymentReceipts = payment => {
    const formattedDate = moment().format('DD-MM-YYYY h:mm a');
    return (
      <div key={payment._id} className="payment-receipt-print-view">
        <Row type="flex" justify="center" style={HeaderStyle}>
          <div>Payment Receipt</div>
        </Row>
        <Row type="flex" justify="start" gutter={10}>
          <Col order={2} style={{ minWidth: '600px' }}>
            <Row type="flex">
              <Col order={1} style={{ minWidth: '600px' }}>
                <Item
                  label="Date"
                  value={moment(Number(payment.paymentDate)).format(
                    'DD MMM, YYYY'
                  )}
                />
              </Col>
              <Col order={2} style={{ minWidth: '100px' }}>
                <Item label="No" value={payment.paymentNumber} />
              </Col>
            </Row>

            <Item label="Received Cash Rs:" value={payment.paymentAmount} />
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
                <Item label="Cell#" value={payment.contactNumber} />
              </Col>
            </Row>
            <Row type="flex">
              <Col order={1} style={{ minWidth: '350px' }}>
                <Item label="Signature" value={'' || ''} />
              </Col>
              <Col order={2} style={{ minWidth: '350px' }}>
                <Item label="Approved By" />
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider style={{ margin: '10px' }} />
        <Row>
          <Col order={1}>printed at : {formattedDate}</Col>
        </Row>
      </div>
    );
  };

  render() {
    const { paymentById } = this.props;
    const receiptsForPage = this.getPaymentReceipts(paymentById);

    let index = 0;
    const receiptContainers = [];

    receiptContainers.push(
      <div key={`container_${index}`} style={ContainerStyle}>
        {receiptsForPage}
      </div>
    );
    index++;
    receiptContainers.push(
      <div key={`container_${index}`} style={ContainerStyle}>
        {receiptsForPage}
      </div>
    );
    return <div>{receiptContainers}</div>;
  }
}
