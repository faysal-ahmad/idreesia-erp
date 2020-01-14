import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Row, Spin, message } from '/imports/ui/controls';
import moment from 'moment';

import { Card } from '../mehfil-cards';

const SearchResult = props => {
  const { barcode, loading, mehfilKarkunByBarcodeId } = props;
  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!mehfilKarkunByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { mehfil } = mehfilKarkunByBarcodeId;
  const mehfilName = `${mehfil.name} - ${moment(
    Number(mehfil.mehfilDate)
  ).format('DD MMM, YYYY')}`;

  return (
    <>
      <Row type="flex" justify="center">
        <div
          style={{
            fontWeight: 'bold',
            fontSize: 22,
            color: '#000',
          }}
        >
          {mehfilName}
        </div>
      </Row>
      <Row type="flex" justify="center">
        <Card mehfilKarkun={mehfilKarkunByBarcodeId} />
      </Row>
    </>
  );
};

SearchResult.propTypes = {
  loading: PropTypes.bool,
  barcode: PropTypes.string,
  mehfilKarkunByBarcodeId: PropTypes.object,
};

const formQuery = gql`
  query mehfilKarkunByBarcodeId($barcode: String!) {
    mehfilKarkunByBarcodeId(barcode: $barcode) {
      _id
      mehfilId
      karkunId
      dutyName
      dutyDetail
      dutyCardBarcodeId
      mehfil {
        _id
        name
        mehfilDate
      }
      karkun {
        _id
        name
        image {
          _id
          data
        }
      }
    }
  }
`;

export default flowRight(
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ barcode }) => ({ variables: { barcode } }),
  })
)(SearchResult);
