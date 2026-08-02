import React, { Component, type CSSProperties } from 'react';

import { Formats } from 'meteor/idreesia-common/constants';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { filter, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import type { EidReceiptSalariesByIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import { Col, Divider, Row } from 'antd';

import { Item } from './item';

type EidReceiptRecord = NonNullable<
  NonNullable<EidReceiptSalariesByIdsQuery['salariesByIds']>[number]
>;

interface ReceiptsProps {
  salariesByIds?: EidReceiptRecord[];
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

export default class EidReceipts extends Component<ReceiptsProps> {
  getImageColumn = (karkun: NonNullable<EidReceiptRecord['karkun']>) =>
    karkun.image ? (
      <Col order={1}>
        <img
          src={`data:image/jpeg;base64,${karkun.image.data}`}
          style={{ width: '100px' }}
          alt={karkun.name ?? undefined}
        />
      </Col>
    ) : null;

  getEidReceipts = (salary: EidReceiptRecord) => {
    const { karkun, job } = salary;
    if (!karkun || !job || !salary._id || !salary.month) return null;
    const imageColumn = this.getImageColumn(karkun);
    const displayMonth = formatDate(
      parseDate(`01-${salary.month}`, Formats.DATE_FORMAT),
      'MMM, YYYY'
    );

    return (
      <div key={salary._id} className="form-print-view">
        <Row justify="center" style={HeaderStyle}>
          <div>Eid Receipt - {displayMonth}</div>
        </Row>
        <Row justify="start" gutter={10}>
          {imageColumn}
          <Col order={2} style={{ minWidth: '200px' }}>
            <Item label="Name" value={karkun.name} />
            <Item label="S/O" value={karkun.parentName} />
            <Item label="CNIC" value={karkun.cnicNumber || ''} />
            <Item label="Phone" value={karkun.contactNumber1 || ''} />
            <Item label="Dept." value={job.name} />
          </Col>
          <Col order={3} style={{ minWidth: '200px' }}>
            <Item label="Eid Bonus" value={salary.salary} />
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
      (salary: EidReceiptRecord) => salary.salary !== 0
    );
    const sortedSalariesByMonth = sortBy(filteredSalaries, 'karkun.name');

    const receipts = sortedSalariesByMonth
      .map((salary: EidReceiptRecord) => this.getEidReceipts(salary))
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
