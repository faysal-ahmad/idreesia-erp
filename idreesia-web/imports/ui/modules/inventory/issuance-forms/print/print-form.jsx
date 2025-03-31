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
    issuanceFormById: PropTypes.object,
  };

  getItemsList = () => {
    const { issuanceFormById } = this.props;
    const formattedItems = issuanceFormById.items.map(item => {
      // const key = `${item.stockItemId}${item.isInflow}`;
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
          <Col>{`${quantity} ${item.isInflow ? 'Returned' : 'Issued'}`}</Col>
        </Row>
      );
    });

    return formattedItems;
  }

  render() {
    const { issuanceFormById, physicalStore } = this.props;
    const items = this.getItemsList();

    return (
      <div className="form-print-view">
        <Row type="flex" justify="start" gutter={20}>
          <Col flex={2}>
            <DisplayItem label="Store" value={physicalStore.name} />
            <DisplayItem label="Issue Date" value={dayjs(Number(issuanceFormById.issueDate)).format('DD-MMM-YYYY')} />
            <DisplayItem label="Issued By" value={issuanceFormById.refIssuedBy.name} />
            <DisplayItem label="Issued To" value={issuanceFormById.refIssuedTo.name} />
            <DisplayItem label="Handed Over To" value={issuanceFormById.handedOverTo} />
            <DisplayItem label="For Location" value={issuanceFormById.refLocation?.name} />
          </Col>
          <Col flex={3}>
            <DisplayItem label="Printing Time" value={dayjs().format('DD-MMM-YYYY hh:mm:ss A')} />
            <DisplayItem label="Notes">
              <Input.TextArea style={{ width: '100%' }}>{issuanceFormById.notes}</Input.TextArea>
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


