import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import ReactToPrint from 'react-to-print';

const ControlsContainer = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

const InputControlsContainer = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'flex-start',
};

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Button, Divider, Input } from '/imports/ui/controls';
import Cards from './cards';

const mehfilKarkunsByIdsQuery = gql`
  query mehfilKarkunsByIds($ids: String!) {
    mehfilKarkunsByIds(ids: $ids) {
      _id
      mehfilId
      karkunId
      dutyName
      dutyCardBarcodeId
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

const CardsContainer = ({ queryParams: { ids }, history }) => {
  const [cardSubHeading, setCardSubHeading] = useState(null);
  const mehfilCardsRef = useRef(null);
  const { data, loading } = useQuery(mehfilKarkunsByIdsQuery, {
    variables: { ids },
  });

  if (loading) return null;

  debugger;
  const cardSubHeadingInput = (
    <Input
      placeholder="Sub Heading"
      onChange={event => {
        setCardSubHeading(event.target.value);
      }}
    />
  );

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
            content={() => mehfilCardsRef.current}
            trigger={() => (
              <Button size="large" type="primary" icon="printer">
                Print Cards
              </Button>
            )}
          />
          &nbsp;
          <Button
            size="large"
            type="primary"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </div>
        <div style={InputControlsContainer}>{cardSubHeadingInput}</div>
      </div>
      <Divider />
      <Cards
        ref={mehfilCardsRef}
        cardSubHeading={cardSubHeading}
        mehfilKarkunsByIds={data.mehfilKarkunsByIds}
      />
    </>
  );
};

CardsContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object,
};

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['Security', 'Mehfils', 'Mehfil Cards'])
)(CardsContainer);
