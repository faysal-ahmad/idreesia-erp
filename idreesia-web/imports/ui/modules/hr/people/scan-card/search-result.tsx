// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { addMonths, startOfMonth } from 'date-fns';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { Row, Col, Spin, message } from 'antd';
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
  const { barcode } = props;
  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_ID, {
    skip: !barcode,
    variables: { barcodeId: barcode },
  });
  const { attendanceByBarcodeId } = data || {};

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

  const displayMonth = startOfMonth(
    addMonths(parseDate(`01-${month}`, 'DD-MM-YYYY'), 1)
  );

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
          value={formatDate(displayMonth, 'D MMM YYYY')}
        />
        <SearchResultRow label="Attendance" value={`${percentage}%`} />
      </Col>
    </Row>
  );
};

SearchResult.propTypes = {
  barcode: PropTypes.string,
};

export default SearchResult;
