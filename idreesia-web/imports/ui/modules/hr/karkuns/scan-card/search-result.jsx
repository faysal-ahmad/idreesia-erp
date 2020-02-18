import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Row, Col, Spin, message } from '/imports/ui/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import { ATTENDANCE_BY_BARCODE_ID } from '../gql';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 26,
};

const DataStyle = {
  fontSize: 26,
};

const SearchResultRow = ({ label, value, linkTo }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      {linkTo ? (
        <Link style={DataStyle} to={linkTo}>
          {value}
        </Link>
      ) : (
        <span style={DataStyle}>{value}</span>
      )}
    </Col>
  </Row>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  linkTo: PropTypes.string,
};

const SearchResult = props => {
  const { barcode, loading, attendanceByBarcodeId } = props;
  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!attendanceByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { month, percentage, karkun, duty, shift, job } = attendanceByBarcodeId;

  const url = getDownloadUrl(karkun.imageId);
  const imageColumn = url ? (
    <Col order={1}>
      <img src={url} style={{ width: '250px' }} />
    </Col>
  ) : null;

  const displayMonth = moment(`01-${month}`, 'DD-MM-YYYY')
    .add(1, 'months')
    .startOf('month');

  return (
    <Row type="flex" gutter={16}>
      {imageColumn}
      <Col order={2}>
        <SearchResultRow
          label="Name"
          value={karkun.name}
          linkTo={`${paths.karkunsPath}/${karkun._id}`}
        />
        <SearchResultRow label="CNIC" value={karkun.cnicNumber} />
        <SearchResultRow label="Mobile" value={karkun.contactNumber1} />
        {duty ? <SearchResultRow label="Duty" value={duty.name} /> : null}
        {shift ? <SearchResultRow label="Shift" value={shift.name} /> : null}
        {job ? <SearchResultRow label="Job" value={job.name} /> : null}
        <SearchResultRow
          label="Month"
          value={displayMonth.format('D MMM YYYY')}
        />
        <SearchResultRow label="Attendance" value={`${percentage}%`} />
      </Col>
    </Row>
  );
};

SearchResult.propTypes = {
  loading: PropTypes.bool,
  barcode: PropTypes.string,
  attendanceByBarcodeId: PropTypes.object,
};

export default flowRight(
  graphql(ATTENDANCE_BY_BARCODE_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ barcode }) => ({ variables: { barcodeId: barcode } }),
  })
)(SearchResult);
