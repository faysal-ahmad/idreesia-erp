import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Divider, Input, Row } from 'antd';
import dayjs from 'dayjs';
import Barcode from 'react-barcode';

import { DisplayItem } from '/imports/ui/modules/helpers/controls';

const barcodeOptions = {
  width: 1,
  height: 20,
  format: 'CODE128B',
  displayValue: false,
  background: '#ffffff',
  lineColor: '#000000',
  margin: 5,
};

export class PrintForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    issuanceFormById: PropTypes.object,
  };

  func = () => {}

  render() {
    const { issuanceFormById } = this.props;
    const formattedItems = issuanceFormById.items.map(item => {
      const key = `${item.stockItemId}${item.isInflow}`;
      let quantity = item.quantity;
      if (item.unitOfMeasurement !== 'quantity') {
        quantity = `${quantity} ${item.unitOfMeasurement}`;
      }

      return (
        <li key={key}>
          <span style={{ fontSize: 16 }}>
            {`${item.stockItemName} [${quantity} ${
              item.isInflow ? 'Returned' : 'Issued'
            }]`}
          </span>
        </li>
      );
    });

    return (
      <div className="form-print-view">
        <Row type="flex" justify="start" gutter={20}>
          <Col flex={2}>
            <Barcode value={issuanceFormById._id} {...barcodeOptions} />
            <DisplayItem label="Issue Date" value={dayjs(Number(issuanceFormById.issueDate)).format('DD MMM, YYYY')} />
            <DisplayItem label="Issued By" value={issuanceFormById.refIssuedBy.name} />
            <DisplayItem label="Issued To" value={issuanceFormById.refIssuedTo.name} />
            <DisplayItem label="Handed Over To" value={issuanceFormById.handedOverTo} />
            <DisplayItem label="For Location" value={issuanceFormById.refLocation?.name} />
          </Col>
          <Col flex={3}>
            <DisplayItem label="Notes">
              <Input.TextArea style={{ width: '100%' }}>{issuanceFormById.notes}</Input.TextArea>
            </DisplayItem>
          </Col>
        </Row>
        <Divider style={{ fontSize: 20 }}>Issued / Returned Items</Divider>
        <Row type="flex" justify="space-between" gutter={20}>
          <ul>{formattedItems}</ul>
        </Row>
      </div>
    );
  }
}


