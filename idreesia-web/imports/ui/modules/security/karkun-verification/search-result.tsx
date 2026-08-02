import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AttendanceByBarcodeIdQuery,
  AttendanceByBarcodeIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { addMonths, startOfMonth } from 'date-fns';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { Row, Col, Spin, message } from 'antd';

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
  <Row gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={DataStyle}>{value}</span>
    </Col>
  </Row>
);

const formQuery: TypedDocumentNode<
  AttendanceByBarcodeIdQuery,
  AttendanceByBarcodeIdQueryVariables
> = gql`
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

interface SearchResultProps {
  barcode?: string;
}

const SearchResult = ({ barcode }: SearchResultProps) => {
  const { data, loading } = useQuery(formQuery, {
    skip: !barcode,
    variables: { barcodeId: barcode ?? '' },
  });
  const attendanceByBarcodeId = data?.attendanceByBarcodeId;

  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!attendanceByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { month, percentage, karkun, duty, shift, job } = attendanceByBarcodeId;

  const url = getDownloadUrl(karkun?.imageId ?? undefined);
  const imageColumn = url ? (
    <Col order={1}>
      <img src={url} style={{ width: '250px' }} alt={karkun?.name ?? ''} />
    </Col>
  ) : null;

  const displayMonth = startOfMonth(
    addMonths(parseDate(`01-${month ?? ''}`, 'DD-MM-YYYY'), 1)
  );

  return (
    <Row gutter={16}>
      {imageColumn}
      <Col order={2}>
        <SearchResultRow label="Name" value={karkun?.name} />
        <SearchResultRow label="CNIC" value={karkun?.cnicNumber} />
        <SearchResultRow label="Mobile" value={karkun?.contactNumber1} />
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
