import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityEventKarkunByBarcodeIdQuery,
  SecurityEventKarkunByBarcodeIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { Row, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { formatDate } from 'meteor/idreesia-common/utilities/date-fns';

import { Card } from '../event-karkuns/print/karkun-cards/named-cards';

const formQuery: TypedDocumentNode<
  SecurityEventKarkunByBarcodeIdQuery,
  SecurityEventKarkunByBarcodeIdQueryVariables
> = gql`
  query securityEventKarkunByBarcodeId($barcode: String!) {
    securityEventKarkunByBarcodeId(barcode: $barcode) {
      _id
      eventId
      karkunId
      dutyId
      dutyDetail
      dutyCardBarcodeId
      event {
        _id
        name
        eventDate
      }
      karkun {
        _id
        sharedData {
          name
          imageUrl
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
  const securityEventKarkunByBarcodeId = data?.securityEventKarkunByBarcodeId;

  if (!barcode) return null;
  if (loading) return <Spin size="large" />;

  if (!securityEventKarkunByBarcodeId) {
    message.error(`No records found against scanned barcode ${barcode}`, 2);
    return null;
  }

  const { event } = securityEventKarkunByBarcodeId;
  const eventName = `${event?.name ?? ''} - ${formatDate(
    new Date(Number(event?.eventDate)),
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
          {eventName}
        </div>
      </Row>
      <Row justify="center">
        <Card eventKarkun={securityEventKarkunByBarcodeId} />
      </Row>
    </>
  );
};

export default SearchResult;
