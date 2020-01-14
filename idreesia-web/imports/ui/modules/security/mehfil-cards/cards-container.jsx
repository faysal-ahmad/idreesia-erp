import React, { useRef } from 'react';
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

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Button, Divider } from '/imports/ui/controls';
import Cards from './cards';

const mehfilKarkunsByIdsQuery = gql`
  query mehfilKarkunsByIds($ids: String!) {
    mehfilKarkunsByIds(ids: $ids) {
      _id
      mehfilId
      karkunId
      dutyName
      dutyDetail
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
  const mehfilCardsRef = useRef(null);
  const { data, loading } = useQuery(mehfilKarkunsByIdsQuery, {
    variables: { ids },
  });

  if (loading) return null;

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
      </div>
      <Divider />
      <Cards
        ref={mehfilCardsRef}
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
