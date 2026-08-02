import React, { Component } from 'react';
import { type CSSProperties } from 'react';
import { Col, Divider, Input, Row } from 'antd';
import dayjs from 'dayjs';
import type { IssuanceFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';

import { DisplayItem } from '/imports/ui/modules/helpers/controls';

const RowStyle: CSSProperties = {
  border: 'none',
  borderBottom: '1px dotted #444',
  color: '#fff',
  backgroundColor: '#fff',
  height: '1px',
  width: '100%',
};

type IssuanceForm = NonNullable<IssuanceFormByIdQuery['issuanceFormById']>;
type IssuanceItem = NonNullable<NonNullable<IssuanceForm['items']>[number]>;

interface PrintFormProps {
  physicalStoreId?: string;
  physicalStore: { name: string };
  issuanceFormById: IssuanceForm;
}

export class PrintForm extends Component<PrintFormProps> {
  getItemsList = () => {
    const { issuanceFormById } = this.props;
    return (issuanceFormById.items ?? [])
      .filter((item): item is IssuanceItem => item != null)
      .map((item) => {
        let quantity: number | string = item.quantity ?? 0;
        if (item.refStockItem?.unitOfMeasurement !== 'quantity') {
          quantity = `${quantity} ${item.refStockItem?.unitOfMeasurement ?? ''}`;
        }

        return (
          <Row style={{ fontSize: 16 }} justify="space-between" gutter={10} key={`${item.stockItemId}${item.isInflow}`}>
            <Col>{item.refStockItem?.name}</Col>
            <Col flex="auto">
              <hr style={RowStyle} />
            </Col>
            <Col>{`${quantity} ${item.isInflow ? 'Returned' : 'Issued'}`}</Col>
          </Row>
        );
      });
  };

  render() {
    const { issuanceFormById, physicalStore } = this.props;
    const items = this.getItemsList();

    return (
      <div className="form-print-view">
        <Row justify="start" gutter={20}>
          <Col flex={2}>
            <DisplayItem label="Store" value={physicalStore.name} />
            <DisplayItem label="Issue Date" value={dayjs(Number(issuanceFormById.issueDate)).format('DD-MMM-YYYY')} />
            <DisplayItem label="Issued By" value={issuanceFormById.refIssuedBy?.name ?? ''} />
            <DisplayItem label="Issued To" value={issuanceFormById.refIssuedTo?.name ?? ''} />
            <DisplayItem label="Handed Over To" value={issuanceFormById.handedOverTo ?? undefined} />
            <DisplayItem label="For Location" value={issuanceFormById.refLocation?.name ?? undefined} />
          </Col>
          <Col flex={3}>
            <DisplayItem label="Printing Time" value={dayjs().format('DD-MMM-YYYY hh:mm:ss A')} />
            <DisplayItem label="Notes">
              <Input.TextArea style={{ width: '100%' }}>{issuanceFormById.notes}</Input.TextArea>
            </DisplayItem>
          </Col>
        </Row>
        <Divider style={{ fontSize: 20 }}>Issued / Returned Items</Divider>
        <Row justify="space-between" gutter={20}>
          <Col flex="auto">
            {items}
          </Col>
        </Row>
      </div>
    );
  }
}
