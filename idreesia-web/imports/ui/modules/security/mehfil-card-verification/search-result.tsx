import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

import { Row, Spin, message } from 'antd';
import { formatDate } from 'meteor/idreesia-common/utilities/date-fns';

import { Card } from '../mehfil-karkuns/print/karkun-cards/named-cards';

const AntRow = Row as any;
const AntSpin = Spin as any;
const KarkunCard = Card as any;

interface Mehfil {
  name: string;
  mehfilDate: string | number;
}

interface MehfilKarkun {
  mehfil: Mehfil;
}

interface MehfilKarkunData {
  mehfilKarkunByBarcodeId?: MehfilKarkun | null;
}

interface SearchResultProps {
  barcode?: string;
}

const SearchResult = (props: SearchResultProps) => {
  const { barcode } = props;
  const { data = {}, loading } = useQuery(formQuery as any, {
    variables: { barcode },
  });
  const { mehfilKarkunByBarcodeId } = data as MehfilKarkunData;
  if (!barcode) return null;
  if (loading) return <AntSpin size="large" />;

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
      <AntRow type="flex" justify="center">
        <div
          style={{
            fontWeight: 'bold',
            fontSize: 22,
            color: '#000',
          }}
        >
          {mehfilName}
        </div>
      </AntRow>
      <AntRow type="flex" justify="center">
        <KarkunCard mehfilKarkun={mehfilKarkunByBarcodeId} />
      </AntRow>
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
