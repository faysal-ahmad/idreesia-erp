import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Formats } from 'meteor/idreesia-common/constants';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { filter, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { Col, Divider, Row } from 'antd';

import { Item } from './item';

const AntCol = Col as any;
const AntDivider = Divider as any;
const AntRow = Row as any;
const ReceiptItem = Item as any;
interface Karkun { name: string; parentName?: string; cnicNumber?: string; contactNumber1?: string; image?: { data?: string }; }
interface Job { name: string; }
interface SalaryReceiptRecord { _id: string; month: string; karkun: Karkun; job: Job; salary?: number; openingLoan?: number; loanDeduction?: number; otherDeduction?: number; newLoan?: number; closingLoan?: number; arrears?: number; netPayment?: number; rashanMadad?: number; }
interface ReceiptsProps { salariesByIds?: SalaryReceiptRecord[]; }

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center',
  width: '800px',
  padding: '20px',
};

const HeaderStyle = {
  fontSize: 20,
  border: 'solid',
};

export default class RashanReceipts extends Component<ReceiptsProps> {
  static propTypes = {
    salariesByIds: PropTypes.array,
  };

  getImageColumn = (karkun: Karkun) =>
    karkun.image ? (
      <AntCol order={1}>
        <img
          src={`data:image/jpeg;base64,${karkun.image.data}`}
          style={{ width: '100px' }}
          alt={karkun.name}
        />
      </AntCol>
    ) : null;

  getRashanReceipts = (salary: SalaryReceiptRecord) => {
    const { karkun, job } = salary;
    const imageColumn = this.getImageColumn(karkun);
    const displayMonth = formatDate(
      parseDate(`01-${salary.month}`, Formats.DATE_FORMAT),
      'MMM, YYYY'
    );

    return (
      <div key={salary._id} className="form-print-view">
        <AntRow type="flex" justify="center" style={HeaderStyle as any}>
          <div>Rashan Receipt - {displayMonth}</div>
        </AntRow>
        <AntRow type="flex" justify="start" gutter={10}>
          {imageColumn}
          <AntCol order={2} style={{ minWidth: '200px' }}>
            <ReceiptItem label="Name" value={karkun.name} />
            <ReceiptItem label="S/O" value={karkun.parentName} />
            <ReceiptItem label="CNIC" value={karkun.cnicNumber || ''} />
            <ReceiptItem label="Phone" value={karkun.contactNumber1 || ''} />
            <ReceiptItem label="Dept." value={job.name} />
          </AntCol>
          <AntCol order={3} style={{ minWidth: '200px' }}>
            <ReceiptItem label="Rashan Payment" value={salary.rashanMadad} />
            <ReceiptItem label="Signature" value="" />
          </AntCol>
        </AntRow>
        <AntDivider style={{ margin: '10px' }} />
      </div>
    );
  };

  render() {
    const { salariesByIds } = this.props;
    // Filter out records where the rashan amount is zero.
    const filteredSalaries = filter(
      salariesByIds ?? [],
      (salary: SalaryReceiptRecord) => salary.rashanMadad !== 0
    );
    const sortedSalariesByMonth = sortBy(filteredSalaries, 'karkun.name');

    const receipts = sortedSalariesByMonth.map((salary: SalaryReceiptRecord) =>
      this.getRashanReceipts(salary)
    );

    let index = 0;
    const receiptContainers = [];
    while (receipts.length > 0) {
      const receiptsForPage = receipts.splice(0, 4);
      receiptContainers.push(
        <div key={`container_${index}`} style={ContainerStyle as any}>
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
