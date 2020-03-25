import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
// import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { ActivityIndicator, List, Toast } from '/imports/ui/controls';

// import { Card } from './card';

const SearchResult = props => {
  const { barcode, loading, error, attendanceByBarcodeId } = props;
  if (!barcode) return null;
  if (loading) {
    return <ActivityIndicator text="Loading..." />;
  }

  if (error) {
    console.log(error);
  }

  if (!attendanceByBarcodeId) {
    Toast.fail(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { karkun } = attendanceByBarcodeId;

  return (
    <>
      <List>
        <div
          style={{
            fontWeight: 'bold',
            fontSize: 22,
            color: '#000',
          }}
        >
          {karkun.name}
        </div>
      </List>
    </>
  );
};

SearchResult.propTypes = {
  barcode: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.object,
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

export default flowRight(
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ barcode }) => ({ variables: { barcodeId: barcode } }),
  })
)(SearchResult);
