// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

import { Row, Spin, message } from 'antd';
import { formatDate } from 'meteor/idreesia-common/utilities/date-fns';

import { Card } from '../mehfil-karkuns/print/karkun-cards/named-cards';

const SearchResult = props => {
  const { barcode } = props;
  const { data = {}, loading } = useQuery(formQuery, {
    variables: { barcode },
  });
  const { mehfilKarkunByBarcodeId } = data;
  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!mehfilKarkunByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { mehfil } = mehfilKarkunByBarcodeId;
  const mehfilName = `${mehfil.name} - ${formatDate(
    new Date(Number(mehfil.mehfilDate)),
    'DD MMM, YYYY'
  )}`;

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
      dutyId
      dutyDetail
      dutyCardBarcodeId
      mehfil {
        _id
        name
        mehfilDate
      }
      karkun {
        _id
        sharedData {
          name
          image {
            _id
            data
          }
        }
      }
    }
  }
`;

export default SearchResult;
