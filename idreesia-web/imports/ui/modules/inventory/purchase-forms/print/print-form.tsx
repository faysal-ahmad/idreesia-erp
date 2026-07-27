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

const AntCol = Col as any;
const AntDivider = Divider as any;
const AntInputTextArea = Input.TextArea as any;
const AntRow = Row as any;
const DisplayItemComponent = DisplayItem as any;

interface PurchaseItem {
  quantity: number;
  isInflow: boolean;
  price?: number;
  refStockItem: {
    name: string;
    unitOfMeasurement?: string;
  };
}

interface PurchaseForm {
  issueDate?: string;
  purchaseDate?: string;
  items: PurchaseItem[];
  refPurchasedBy: { name: string };
  refReceivedBy: { name: string };
  refVendor?: { name: string };
  refLocation?: { name: string };
  notes?: string;
}

interface PrintFormProps {
  physicalStoreId?: string;
  physicalStore: { name: string };
  purchaseFormById: PurchaseForm;
}

export class PrintForm extends Component<PrintFormProps> {
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
    const formattedItems = purchaseFormById.items.map((item: PurchaseItem) => {
      let quantity: number | string = item.quantity;
      if (item.refStockItem.unitOfMeasurement !== 'quantity') {
        quantity = `${quantity} ${item.refStockItem.unitOfMeasurement}`;
      }

      return (
        <AntRow style={{ fontSize: 16 }} justify="space-between" gutter={10}>
          <AntCol>{item.refStockItem.name}</AntCol>
          <AntCol flex="auto">
            <hr style={RowStyle} />
          </AntCol>
          <AntCol>{`${quantity} ${item.isInflow ? 'Purchased' : 'Returned'} for Rs. ${item.price || '???'}`}</AntCol>
        </AntRow>
      );
    });

    return formattedItems;
  }

  render() {
    const { purchaseFormById, physicalStore } = this.props;
    const items = this.getItemsList();

    return (
      <div className="form-print-view">
        <AntRow type="flex" justify="start" gutter={20}>
          <AntCol flex={2}>
            <DisplayItemComponent label="Store" value={physicalStore.name} />
            <DisplayItemComponent label="Purchase Date" value={dayjs(Number(purchaseFormById.purchaseDate ?? purchaseFormById.issueDate)).format('DD-MMM-YYYY')} />
            <DisplayItemComponent label="Purchased By" value={purchaseFormById.refPurchasedBy.name} />
            <DisplayItemComponent label="Vendor" value={purchaseFormById.refVendor?.name} />
            <DisplayItemComponent label="For Location" value={purchaseFormById.refLocation?.name} />
            <DisplayItemComponent label="Received By" value={purchaseFormById.refReceivedBy.name} />
          </AntCol>
          <AntCol flex={3}>
            <DisplayItemComponent label="Printing Time" value={dayjs().format('DD-MMM-YYYY hh:mm:ss A')} />
            <DisplayItemComponent label="Notes">
              <AntInputTextArea style={{ width: '100%' }}>{purchaseFormById.notes}</AntInputTextArea>
            </DisplayItemComponent>
          </AntCol>
        </AntRow>
        <AntDivider style={{ fontSize: 20 }}>Issued / Returned Items</AntDivider>
        <AntRow type="flex" justify="space-between" gutter={20}>
          <AntCol flex="auto">
            {items}
          </AntCol>
        </AntRow>
      </div>
    );
  };
}


