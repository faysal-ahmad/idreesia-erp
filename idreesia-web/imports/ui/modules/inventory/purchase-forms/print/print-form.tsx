import React, { Component } from 'react';
import { type CSSProperties } from 'react';
import { Col, Divider, Input, Row } from 'antd';
import dayjs from 'dayjs';
import type { InventoryPurchaseFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { DisplayItem } from '/imports/ui/modules/helpers/controls';

const RowStyle: CSSProperties = {
  border: 'none',
  borderBottom: '1px dotted #444',
  color: '#fff',
  backgroundColor: '#fff',
  height: '1px',
  width: '100%',
};

type PurchaseForm = NonNullable<InventoryPurchaseFormByIdQuery['purchaseFormById']>;
type PurchaseItem = NonNullable<NonNullable<PurchaseForm['items']>[number]>;

interface PrintFormProps {
  physicalStoreId?: string;
  physicalStore: { name: string };
  purchaseFormById: PurchaseForm;
}

export class PrintForm extends Component<PrintFormProps> {
  getItemsList = () => (this.props.purchaseFormById.items ?? [])
    .filter((item): item is PurchaseItem => item != null)
    .map((item) => {
      let quantity: number | string = item.quantity ?? 0;
      if (item.refStockItem?.unitOfMeasurement !== 'quantity') {
        quantity = `${quantity} ${item.refStockItem?.unitOfMeasurement ?? ''}`;
      }
      return (
        <Row style={{ fontSize: 16 }} justify="space-between" gutter={10} key={`${item.stockItemId}${item.isInflow}`}>
          <Col>{item.refStockItem?.name}</Col>
          <Col flex="auto"><hr style={RowStyle} /></Col>
          <Col>{`${quantity} ${item.isInflow ? 'Purchased' : 'Returned'} for Rs. ${item.price || '???'}`}</Col>
        </Row>
      );
    });

  render() {
    const { purchaseFormById, physicalStore } = this.props;
    return (
      <div className="form-print-view">
        <Row justify="start" gutter={20}>
          <Col flex={2}>
            <DisplayItem label="Store" value={physicalStore.name} />
            <DisplayItem label="Purchase Date" value={dayjs(Number(purchaseFormById.purchaseDate)).format('DD-MMM-YYYY')} />
            <DisplayItem label="Purchased By" value={purchaseFormById.refPurchasedBy?.name ?? ''} />
            <DisplayItem label="Vendor" value={purchaseFormById.refVendor?.name ?? undefined} />
            <DisplayItem label="For Location" value={purchaseFormById.refLocation?.name ?? undefined} />
            <DisplayItem label="Received By" value={purchaseFormById.refReceivedBy?.name ?? ''} />
          </Col>
          <Col flex={3}>
            <DisplayItem label="Printing Time" value={dayjs().format('DD-MMM-YYYY hh:mm:ss A')} />
            <DisplayItem label="Notes">
              <Input.TextArea style={{ width: '100%' }}>{purchaseFormById.notes}</Input.TextArea>
            </DisplayItem>
          </Col>
        </Row>
        <Divider style={{ fontSize: 20 }}>Issued / Returned Items</Divider>
        <Row justify="space-between" gutter={20}>
          <Col flex="auto">{this.getItemsList()}</Col>
        </Row>
      </div>
    );
  }
}
