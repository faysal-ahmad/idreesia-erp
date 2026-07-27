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

const RouterLink = Link as any;
const AntRow = Row as any;
const AntCol = Col as any;
const AntSpin = Spin as any;
interface SearchResultRowProps { label: string; value?: string | number | null; linkTo?: string; }
interface SearchResultProps { barcode?: string; }
interface Karkun { _id: string; name: string; imageId?: string; cnicNumber?: string; contactNumber1?: string; }
interface NamedRecord { name: string; }
interface AttendanceRecord { month: string; percentage: number; karkun: Karkun; duty?: NamedRecord | null; shift?: NamedRecord | null; job?: NamedRecord | null; }
interface QueryData { attendanceByBarcodeId?: AttendanceRecord | null; }

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 26,
};

const DataStyle = {
  fontSize: 26,
};

const SearchResultRow = ({ label, value, linkTo }: SearchResultRowProps) => (
  <AntRow gutter={16}>
    <AntCol order={1}>
      <span style={LabelStyle as any}>{label}:</span>
    </AntCol>
    <AntCol order={2}>
      {linkTo ? (
        <RouterLink style={DataStyle as any} to={linkTo}>
          {value}
        </RouterLink>
      ) : (
        <span style={DataStyle as any}>{value}</span>
      )}
    </AntCol>
  </AntRow>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  linkTo: PropTypes.string,
};

const SearchResult = ({ barcode }: SearchResultProps) => {
  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_ID as any, {
    skip: !barcode,
    variables: { barcodeId: barcode },
  });
  const { attendanceByBarcodeId } = (data ?? {}) as QueryData;

  if (!barcode) return null;
  if (loading) return <AntSpin size="large" />;

  if (!attendanceByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { month, percentage, karkun, duty, shift, job } = attendanceByBarcodeId;

  const url = getDownloadUrl(karkun.imageId);
  const imageColumn = url ? (
    <AntCol order={1}>
      <img src={url} style={{ width: '250px' }} alt={karkun.name} />
    </AntCol>
  ) : null;

  const displayMonth = startOfMonth(
    addMonths(parseDate(`01-${month}`, 'DD-MM-YYYY'), 1)
  );

  return (
    <AntRow gutter={16}>
      {imageColumn}
      <AntCol order={2}>
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
      </AntCol>
    </AntRow>
  );
};

SearchResult.propTypes = {
  barcode: PropTypes.string,
};

export default SearchResult;
