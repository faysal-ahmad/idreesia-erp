import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { sortBy } from 'meteor/idreesia-common/utilities/lodash';
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
            <Item label="CNIC" value={karkun.cnicNumber || ''} />
            <Item label="Phone" value={karkun.contactNumber1 || ''} />
            <Item label="Dept." value={job.name} />
            <Item label="Month" value={displayMonth} />
          </Col>
          <Col order={3}>
            <Item label="Salary" value={salary.salary} />
            <Item label="L/OB" value={salary.openingLoan || 0} />
            <Item label="Loan Ded." value={salary.loanDeduction || 0} />
            <Item label="Other Ded." value={salary.otherDeduction || 0} />
            <Item label="New Loan" value={salary.newLoan || 0} />
          </Col>
          <Col order={4}>
            <Item label="L/CB" value={salary.closingLoan || 0} />
            <Item label="Arrears" value={salary.arrears || 0} />
            <Item label="Net Payment" value={salary.netPayment || 0} />
            <Item label="Signature" value="" />
          </Col>
        </Row>
        <Divider style={{ margin: '10px' }} />
      </div>
    );
  };

  render() {
    const { salariesByIds } = this.props;
    const sortedSalariesByMonth = sortBy(salariesByIds, 'karkun.name');

    const receipts = sortedSalariesByMonth.map(salary =>
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
