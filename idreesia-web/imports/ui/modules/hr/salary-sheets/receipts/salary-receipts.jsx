import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { Col, Divider, Row } from '/imports/ui/controls';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 16,
};

const DataStyle = {
  fontSize: 16,
};

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center',
  width: '800px',
  padding: '20px',
};

const Item = ({ label, value }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={DataStyle}>{value}</span>
    </Col>
  </Row>
);

Item.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
};

export default class SalaryReceipts extends Component {
  static propTypes = {
    salariesByIds: PropTypes.array,
  };

  getImageColumn = karkun =>
    karkun.image ? (
      <Col order={1}>
        <img
          src={`data:image/jpeg;base64,${karkun.image.data}`}
          style={{ width: '100px' }}
        />
      </Col>
    ) : null;

  getSalaryReceipts = salary => {
    const { karkun, job } = salary;
    const imageColumn = this.getImageColumn(karkun);
    const displayMonth = moment(
      `01-${salary.month}`,
      Formats.DATE_FORMAT
    ).format('MMM, YYYY');

    return (
      <div key={salary._id} className="salary-receipt-print-view">
        <Row type="flex" justify="start" gutter={10}>
          {imageColumn}
          <Col order={2}>
            <Item label="Name" value={karkun.name} />
            <Item label="CNIC" value={karkun.cnicNumber} />
            <Item label="Phone" value={karkun.contactNumber1} />
            <Item label="Job" value={job.name} />
            <Item label="Month" value={displayMonth} />
          </Col>
          <Col order={3}>
            <Item label="Salary" value={salary.salary} />
            <Item label="L/OB" value={salary.openingLoan} />
            <Item label="Loan Ded." value={salary.loanDeduction} />
            <Item label="Other Ded." value={salary.otherDeduction} />
            <Item label="New Loan" value={salary.newLoan} />
          </Col>
          <Col order={4}>
            <Item label="L/CB" value={salary.closingLoan} />
            <Item label="Net Payment" value={salary.netPayment} />
            <Item label="Signature" value="" />
          </Col>
        </Row>
        <Divider style={{ margin: '10px' }} />
      </div>
    );
  };

  render() {
    const { salariesByIds } = this.props;
    const receipts = salariesByIds.map(salary =>
      this.getSalaryReceipts(salary)
    );

    let index = 0;
    const receiptContainers = [];
    while (receipts.length > 0) {
      const receiptsForPage = receipts.splice(0, 5);
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
