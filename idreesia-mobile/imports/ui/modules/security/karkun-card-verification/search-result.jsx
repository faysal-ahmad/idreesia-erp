import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useQuery } from '@apollo/react-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import {
  ActivityIndicator,
  List,
  Result,
  WingBlank,
  WhiteSpace,
  SearchResultRow,
} from '/imports/ui/controls';

import { ATTENDANCE_BY_BARCODE_ID } from './gql';

const IconStyle = { fontSize: 50, margin: 0, color: 'red' };
const WarningStyle = {
  fontSize: 22,
  color: 'red',
};

const SearchResult = ({ barcode }) => {
  const { data, loading } = useQuery(ATTENDANCE_BY_BARCODE_ID, {
    variables: {
      barcodeId: barcode,
    },
  });

  if (loading) {
    return <ActivityIndicator text="Loading..." />;
  }

  const { attendanceByBarcodeId } = data;
  if (!attendanceByBarcodeId) {
    return (
      <Result
        img={<FontAwesomeIcon icon={faTimesCircle} style={IconStyle} />}
        title="Not Found"
      />
    );
  }

  const { karkun, duty, shift, job } = attendanceByBarcodeId;
  const month = moment(attendanceByBarcodeId.month, 'MM-YYYY')
    .add(1, 'month')
    .endOf('month');
  const isExpired = moment().isAfter(month);

  return (
    <WingBlank>
      {isExpired ? <span style={WarningStyle}>Card Expired</span> : null}
      <List>
        <WhiteSpace size="sm" />
        <SearchResultRow label="Name" data={karkun.name} />
        <WhiteSpace size="sm" />
        <SearchResultRow label="CNIC" data={karkun.cnicNumber} />
        <WhiteSpace size="sm" />
        <SearchResultRow label="Mobile No." data={karkun.contactNumber1} />
        <WhiteSpace size="sm" />
        {duty ? (
          <>
            <SearchResultRow label="Duty" data={duty.name} />
            <WhiteSpace size="sm" />
            <SearchResultRow label="Shift" data={shift?.name} />
            <WhiteSpace size="sm" />
          </>
        ) : null}
        {job ? (
          <>
            <SearchResultRow label="Job" data={job.name} />
            <WhiteSpace size="sm" />
          </>
        ) : null}
      </List>
      <img src={getDownloadUrl(karkun.imageId)} />
    </WingBlank>
  );
};

SearchResult.propTypes = {
  barcode: PropTypes.string,
};

export default SearchResult;
