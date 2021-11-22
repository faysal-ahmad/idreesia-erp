import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { filter, sortBy } from 'meteor/idreesia-common/utilities/lodash';
import { Col, Divider, Row } from 'antd';

import { Item } from './item';

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

export default class RashanReceipts extends Component {
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

  getRashanReceipts = salary => {
    const { karkun, job } = salary;
    const imageColumn = this.getImageColumn(karkun);
    const displayMonth = moment(
      `01-${salary.month}`,
      Formats.DATE_FORMAT
    ).format('MMM, YYYY');

    return (
      <div key={salary._id} className="salary-receipt-print-view">
        <Row type="flex" justify="center" style={HeaderStyle}>
          <div>Rashan Receipt - {displayMonth}</div>
        </Row>
        <Row type="flex" justify="start" gutter={10}>
          {imageColumn}
          <Col order={2} style={{ minWidth: '200px' }}>
            <Item label="Name" value={karkun.name} />
            <Item label="S/O" value={karkun.parentName} />
            <Item label="CNIC" value={karkun.cnicNumber || ''} />
            <Item label="Phone" value={karkun.contactNumber1 || ''} />
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
    // Filter out records where the rashan amount is zero.
    const filteredSalaries = filter(
      salariesByIds,
      salary => salary.rashanMadad !== 0
    );
    const sortedSalariesByMonth = sortBy(filteredSalaries, 'karkun.name');

    const receipts = sortedSalariesByMonth.map(salary =>
      this.getRashanReceipts(salary)
    );

    let index = 0;
    const receiptContainers = [];
    while (receipts.length > 0) {
      const receiptsForPage = receipts.splice(0, 4);
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
