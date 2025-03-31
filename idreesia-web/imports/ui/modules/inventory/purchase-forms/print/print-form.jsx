import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Divider, Input, Row } from 'antd';
import dayjs from 'dayjs';

import { DisplayItem } from '/imports/ui/modules/helpers/controls';

const RowStyle = {
  border: 'none',
  borderBottom: '1px dotted #444',
  color: '#fff',
  backgroundColor: '#fff',
  height: '1px',
  width: '100%',
};

export class PrintForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    purchaseFormById: PropTypes.object,
  };

  getItemsList = () => {
    const { purchaseFormById } = this.props;
    const formattedItems = purchaseFormById.items.map(item => {
      let quantity = item.quantity;
      if (item.unitOfMeasurement !== 'quantity') {
        quantity = `${quantity} ${item.unitOfMeasurement}`;
      }

      return (
        <Row style={{ fontSize: 16 }} justify="space-between" gutter={10}>
          <Col>{item.stockItemName}</Col>
          <Col flex='auto'>
            <hr style={RowStyle} />
          </Col>
          <Col>{`${quantity} ${item.isInflow ? 'Purchased' : 'Returned'} for Rs. ${item.price || '???'}`}</Col>
        </Row>
      );
    });

    return formattedItems;
  }

  render() {
    const { purchaseFormById, physicalStore } = this.props;
    const items = this.getItemsList();

    return (
      <div className="form-print-view">
        <Row type="flex" justify="start" gutter={20}>
          <Col flex={2}>
            <DisplayItem label="Store" value={physicalStore.name} />
            <DisplayItem label="Purchase Date" value={dayjs(Number(purchaseFormById.issueDate)).format('DD-MMM-YYYY')} />
            <DisplayItem label="Purchased By" value={purchaseFormById.refPurchasedBy.name} />
            <DisplayItem label="Vendor" value={purchaseFormById.refVendor?.name} />
            <DisplayItem label="For Location" value={purchaseFormById.refLocation?.name} />
            <DisplayItem label="Received By" value={purchaseFormById.refReceivedBy.name} />
          </Col>
          <Col flex={3}>
            <DisplayItem label="Printing Time" value={dayjs().format('DD-MMM-YYYY hh:mm:ss A')} />
            <DisplayItem label="Notes">
              <Input.TextArea style={{ width: '100%' }}>{purchaseFormById.notes}</Input.TextArea>
            </DisplayItem>
          </Col>
        </Row>
        <Divider style={{ fontSize: 20 }}>Issued / Returned Items</Divider>
        <Row type="flex" justify="space-between" gutter={20}>
          <Col flex='auto'>
            {items}
          </Col>
        </Row>
      </div>
    );
  }
}


