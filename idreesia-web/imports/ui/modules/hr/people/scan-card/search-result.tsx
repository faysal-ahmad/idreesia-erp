import React, { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { addMonths, startOfMonth } from 'date-fns';
import { Row, Col, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import { ATTENDANCE_BY_BARCODE_ID } from '../gql';

const RouterLink = Link as any;

interface SearchResultRowProps {
  label: string;
  value?: string | number | null;
  linkTo?: string;
}

interface SearchResultProps {
  barcode?: string;
}

const LabelStyle: CSSProperties = {
  fontWeight: 'bold',
  fontSize: 26,
};

const DataStyle: CSSProperties = {
  fontSize: 26,
};

const SearchResultRow = ({ label, value, linkTo }: SearchResultRowProps) => (
  <Row gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      {linkTo ? (
        <RouterLink style={DataStyle} to={linkTo}>
          {value}
        </RouterLink>
      ) : (
        <span style={DataStyle}>{value}</span>
      )}
    </Col>
  </Row>
);

const SearchResult = ({ barcode }: SearchResultProps) => {
  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_ID, {
    skip: !barcode,
    variables: { barcodeId: barcode ?? '' },
  });

  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  const attendanceByBarcodeId = data?.attendanceByBarcodeId;
  if (!attendanceByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { month, percentage, karkun, duty, shift, job } = attendanceByBarcodeId;
  if (!karkun?._id || !karkun.name || !month) return null;

  const url = getDownloadUrl(karkun.imageId);
  const imageColumn = url ? (
    <Col order={1}>
      <img src={url} style={{ width: '250px' }} alt={karkun.name} />
    </Col>
  ) : null;

  const displayMonth = startOfMonth(
    addMonths(parseDate(`01-${month}`, 'DD-MM-YYYY'), 1)
  );

  return (
    <Row gutter={16}>
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
        <SearchResultRow label="Attendance" value={`${percentage ?? 0}%`} />
      </Col>
    </Row>
  );
};

export default SearchResult;
