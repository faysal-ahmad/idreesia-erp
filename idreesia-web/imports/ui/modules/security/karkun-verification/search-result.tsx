import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import { addMonths, startOfMonth } from 'date-fns';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { Row, Col, Spin, message } from 'antd';

const AntRow = Row as any;
const AntCol = Col as any;
const AntSpin = Spin as any;

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 26,
};

const DataStyle = {
  fontSize: 26,
};

interface SearchResultRowProps {
  label: string;
  value?: string | number | null;
}

const SearchResultRow = ({ label, value }: SearchResultRowProps) => (
  <AntRow type="flex" gutter={16}>
    <AntCol order={1}>
      <span style={LabelStyle}>{label}:</span>
    </AntCol>
    <AntCol order={2}>
      <span style={DataStyle}>{value}</span>
    </AntCol>
  </AntRow>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

interface NamedRecord {
  name: string;
}

interface KarkunRecord {
  name: string;
  cnicNumber?: string;
  contactNumber1?: string;
  imageId?: string;
}

interface AttendanceRecord {
  month: string;
  percentage: number;
  karkun: KarkunRecord;
  duty?: NamedRecord | null;
  shift?: NamedRecord | null;
  job?: NamedRecord | null;
}

interface AttendanceData {
  attendanceByBarcodeId?: AttendanceRecord | null;
}

interface SearchResultProps {
  barcode?: string;
}

const SearchResult = (props: SearchResultProps) => {
  const { barcode } = props;
  const { data = {}, loading } = useQuery(formQuery as any, {
    variables: { barcodeId: barcode },
  });
  const { attendanceByBarcodeId } = data as AttendanceData;
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
    <AntRow type="flex" gutter={16}>
      {imageColumn}
      <AntCol order={2}>
        <SearchResultRow label="Name" value={karkun.name} />
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
  loading: PropTypes.bool,
  barcode: PropTypes.string,
  attendanceByBarcodeId: PropTypes.object,
};

const formQuery = gql`
  query attendanceByBarcodeId($barcodeId: String!) {
    attendanceByBarcodeId(barcodeId: $barcodeId) {
      _id
      karkunId
      dutyId
      shiftId
      month
      absentCount
      presentCount
      percentage
      karkun {
        _id
        name
        cnicNumber
        contactNumber1
        imageId
      }
      duty {
        _id
        name
      }
      shift {
        _id
        name
      }
      job {
        _id
        name
      }
    }
  }
`;

export default SearchResult;
