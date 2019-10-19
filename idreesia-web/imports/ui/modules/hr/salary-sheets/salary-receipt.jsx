import React, { Component, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactToPrint from 'react-to-print';

import { Formats } from 'meteor/idreesia-common/constants';
import { Button, Col, Divider, Icon, Row } from '/imports/ui/controls';
import { getDownloadUrl } from '/imports/ui/modules/helpers/misc';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 22,
};

const DataStyle = {
  fontSize: 22,
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

class PrintableSalaryReceipt extends Component {
  getImageColumn = () => {
    const { karkun } = this.props;
    const url = getDownloadUrl(karkun.imageId);
    return url ? (
      <Col order={1}>
        <img src={url} style={{ width: '200px' }} />
      </Col>
    ) : null;
  };

  render() {
    const { salary, karkun, job } = this.props;
    const imageColumn = this.getImageColumn();
    const displayMonth = moment(
      `01-${salary.month}`,
      Formats.DATE_FORMAT
    ).format('MMM, YYYY');

    return (
      <div className="toppadding">
        <Row type="flex" justify="space-around" gutter={10}>
          {imageColumn}
          <Col order={2}>
            <Item label="Name" value={karkun.name} />
            <Item label="CNIC" value={karkun.cnicNumber} />
            <Item label="Phone" value={karkun.contactNumber1} />
            <Item label="Job" value={job.name} />
          </Col>
        </Row>
        <Divider />
        <Row type="flex" justify="space-around" gutter={10}>
          <Col order={1}>
            <Item label="Month" value={displayMonth} />
            <Item label="Salary" value={salary.salary} />
            <Item label="L/OB" value={salary.openingLoan} />
            <Item label="Deduction" value={salary.deduction} />
          </Col>
          <Col order={2}>
            <Item label="New Loan" value={salary.newLoan} />
            <Item label="L/CB" value={salary.closingLoan} />
            <Item label="Net Payment" value={salary.netPayment} />
            <Item label="Signature" value="" />
          </Col>
        </Row>
      </div>
    );
  }
}

PrintableSalaryReceipt.propTypes = {
  salary: PropTypes.object,
  karkun: PropTypes.object,
  job: PropTypes.object,
};

const SalaryReceipt = ({ salary, karkun, job }) => {
  const printableReceipt = useRef(null);

  return (
    <>
      <PrintableSalaryReceipt
        ref={printableReceipt}
        salary={salary}
        karkun={karkun}
        job={job}
      />
      <Divider />
      <Row type="flex" justify="end">
        <Col>
          <ReactToPrint
            trigger={() => (
              <Button type="primary" size="large">
                <Icon type="printer" />
                Print
              </Button>
            )}
            content={() => printableReceipt.current}
          />
        </Col>
      </Row>
    </>
  );
};

SalaryReceipt.propTypes = {
  salary: PropTypes.object,
  karkun: PropTypes.object,
  job: PropTypes.object,
};

export default SalaryReceipt;
