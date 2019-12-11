import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Button, Divider } from '/imports/ui/controls';
import RashanReceipts from './rashan-receipts';

const RashanReceiptsContainer = ({
  salariesLoading,
  salariesByIds,
  history,
}) => {
  const rashanReceiptsRef = useRef(null);
  if (salariesLoading) return null;

  return (
    <>
      <ReactToPrint
        content={() => rashanReceiptsRef.current}
        trigger={() => (
          <Button size="large" type="primary" icon="printer">
            Print Receipts
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
      <Divider />
      <RashanReceipts ref={rashanReceiptsRef} salariesByIds={salariesByIds} />
    </>
  );
};

RashanReceiptsContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  salariesLoading: PropTypes.bool,
  salariesByIds: PropTypes.array,
};

const salariesByIdsQuery = gql`
  query salariesByIds($ids: String!) {
    salariesByIds(ids: $ids) {
      _id
      karkunId
      month
      jobId
      rashanMadad
      karkun {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        image {
          _id
          data
        }
      }
      job {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  WithQueryParams(),
  graphql(salariesByIdsQuery, {
    props: ({ data }) => ({ salariesLoading: data.loading, ...data }),
    options: ({ queryParams: { ids } }) => ({
      variables: { ids },
    }),
  }),
  WithBreadcrumbs(['HR', 'Salary Sheets', 'Rashan Receipts'])
)(RashanReceiptsContainer);
