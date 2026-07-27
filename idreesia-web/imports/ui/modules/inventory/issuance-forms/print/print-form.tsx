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
interface IssuanceItem {
  quantity: number;
  isInflow: boolean;
  refStockItem: { name: string; unitOfMeasurement?: string };
}
interface IssuanceForm {
  issueDate: string;
  items: IssuanceItem[];
  refIssuedBy: { name: string };
  refIssuedTo: { name: string };
  handedOverTo?: string;
  refLocation?: { name: string };
  notes?: string;
}
interface PrintFormProps {
  physicalStoreId?: string;
  physicalStore: { name: string };
  issuanceFormById: IssuanceForm;
}

export class PrintForm extends Component<PrintFormProps> {
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
    const formattedItems = issuanceFormById.items.map((item: IssuanceItem) => {
      // const key = `${item.stockItemId}${item.isInflow}`;
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
          <AntCol>{`${quantity} ${item.isInflow ? 'Returned' : 'Issued'}`}</AntCol>
        </AntRow>
      );
    });

    return formattedItems;
  };

  render() {
    const { issuanceFormById, physicalStore } = this.props;
    const items = this.getItemsList();

    return (
      <div className="form-print-view">
        <AntRow type="flex" justify="start" gutter={20}>
          <AntCol flex={2}>
            <DisplayItemComponent label="Store" value={physicalStore.name} />
            <DisplayItemComponent label="Issue Date" value={dayjs(Number(issuanceFormById.issueDate)).format('DD-MMM-YYYY')} />
            <DisplayItemComponent label="Issued By" value={issuanceFormById.refIssuedBy.name} />
            <DisplayItemComponent label="Issued To" value={issuanceFormById.refIssuedTo.name} />
            <DisplayItemComponent label="Handed Over To" value={issuanceFormById.handedOverTo} />
            <DisplayItemComponent label="For Location" value={issuanceFormById.refLocation?.name} />
          </AntCol>
          <AntCol flex={3}>
            <DisplayItemComponent label="Printing Time" value={dayjs().format('DD-MMM-YYYY hh:mm:ss A')} />
            <DisplayItemComponent label="Notes">
              <AntInputTextArea style={{ width: '100%' }}>{issuanceFormById.notes}</AntInputTextArea>
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
  }
}


