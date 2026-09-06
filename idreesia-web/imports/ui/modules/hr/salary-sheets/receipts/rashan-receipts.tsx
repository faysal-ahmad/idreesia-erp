import React, { Component, type CSSProperties } from 'react';

import { Formats } from 'meteor/idreesia-common/constants';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { filter, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import type { RashanReceiptSalariesByIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import { Col, Divider, Row } from 'antd';

import { Item } from './item';

type RashanReceiptRecord = NonNullable<
  NonNullable<RashanReceiptSalariesByIdsQuery['salariesByIds']>[number]
>;

interface ReceiptsProps {
  salariesByIds?: RashanReceiptRecord[];
}

const ContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center',
  width: '800px',
  padding: '20px',
};

const HeaderStyle: CSSProperties = {
  fontSize: 20,
  border: 'solid',
};

export default class RashanReceipts extends Component<ReceiptsProps> {
  getImageColumn = (karkun: NonNullable<RashanReceiptRecord['karkun']>) =>
    karkun.sharedData?.image ? (
      <Col order={1}>
        <img
          src={`data:image/jpeg;base64,${karkun.sharedData.image.data}`}
          style={{ width: '100px' }}
          alt={karkun.sharedData?.name ?? undefined}
        />
      </Col>
    ) : null;

  getRashanReceipts = (salary: RashanReceiptRecord) => {
    const { karkun, job } = salary;
    if (!karkun || !job || !salary._id || !salary.month) return null;
    const imageColumn = this.getImageColumn(karkun);
    const sharedData = karkun.sharedData ?? ({} as NonNullable<typeof karkun.sharedData>);
    const displayMonth = formatDate(
      parseDate(`01-${salary.month}`, Formats.DATE_FORMAT),
      'MMM, YYYY'
    );

    return (
      <div key={salary._id} className="form-print-view">
        <Row justify="center" style={HeaderStyle}>
          <div>Rashan Receipt - {displayMonth}</div>
        </Row>
        <Row justify="start" gutter={10}>
          {imageColumn}
          <Col order={2} style={{ minWidth: '200px' }}>
            <Item label="Name" value={sharedData.name} />
            <Item label="S/O" value={sharedData.parentName} />
            <Item label="CNIC" value={sharedData.cnicNumber || ''} />
            <Item label="Phone" value={sharedData.contactNumber1 || ''} />
            <Item label="Dept." value={job.name} />
          </Col>
          <Col order={3} style={{ minWidth: '200px' }}>
            <Item label="Rashan Payment" value={salary.rashanMadad} />
            <Item label="Signature" value="" />
          </Col>
        </Row>
        <Divider style={{ margin: '10px' }} />
      </div>
    );
  };

  render() {
    const { salariesByIds } = this.props;
    const filteredSalaries = filter(
      salariesByIds ?? [],
      (salary: RashanReceiptRecord) => salary.rashanMadad !== 0
    );
    const sortedSalariesByMonth = sortBy(
      filteredSalaries,
      (salary: RashanReceiptRecord) => salary.karkun?.sharedData?.name
    );

    const receipts = sortedSalariesByMonth
      .map((salary: RashanReceiptRecord) => this.getRashanReceipts(salary))
      .filter(Boolean);

    let index = 0;
    const receiptContainers = [];
    const receiptsCopy = [...receipts];
    while (receiptsCopy.length > 0) {
      const receiptsForPage = receiptsCopy.splice(0, 4);
      receiptContainers.push(
        <div key={`container_${index}`} style={ContainerStyle}>
          {receiptsForPage}
        </div>
      );
      receiptContainers.push(
        <div key={`pagebreak_${index}`} className="pagebreak" />
      );
      index++;
    }

    return <div>{receiptContainers}</div>;
  }
}
