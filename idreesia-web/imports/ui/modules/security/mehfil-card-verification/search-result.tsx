import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MehfilKarkunByBarcodeIdQuery,
  MehfilKarkunByBarcodeIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { Row, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { formatDate } from 'meteor/idreesia-common/utilities/date-fns';

import { Card } from '../mehfil-karkuns/print/karkun-cards/named-cards';

const formQuery: TypedDocumentNode<
  MehfilKarkunByBarcodeIdQuery,
  MehfilKarkunByBarcodeIdQueryVariables
> = gql`
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

interface SearchResultProps {
  barcode?: string;
}

const SearchResult = ({ barcode }: SearchResultProps) => {
  const { data, loading } = useQuery(formQuery, {
    skip: !barcode,
    variables: { barcode: barcode ?? '' },
  });
  const mehfilKarkunByBarcodeId = data?.mehfilKarkunByBarcodeId;

  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!mehfilKarkunByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { mehfil } = mehfilKarkunByBarcodeId;
  const mehfilName = `${mehfil?.name ?? ''} - ${formatDate(
    new Date(Number(mehfil?.mehfilDate)),
    'DD MMM, YYYY'
  )}`;

  return (
    <>
      <Row justify="center">
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
      <Row justify="center">
        <Card mehfilKarkun={mehfilKarkunByBarcodeId} />
      </Row>
    </>
  );
};

export default SearchResult;
