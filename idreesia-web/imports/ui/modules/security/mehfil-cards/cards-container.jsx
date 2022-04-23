import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import ReactToPrint from 'react-to-print';
import { Button, Checkbox, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import {
  WithMehfilId,
  WithMehfil,
} from '/imports/ui/modules/security/common/composers';

import Cards from './cards';
import AnonymousCards from './anonymous-cards';

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

const CardsContainer = ({ queryParams: { ids, dutyName }, history }) => {
  const mehfilCardsRef = useRef(null);
  const [showDutyNameInUrdu, setShowDutyNameInUrdu] = useState(false);
  const { data, loading } = useQuery(mehfilKarkunsByIdsQuery, {
    variables: { ids },
  });

  if (loading) return null;

  const cards = ids ? (
    <Cards
      ref={mehfilCardsRef}
      mehfilKarkunsByIds={data.mehfilKarkunsByIds}
      showDutyNameInUrdu={showDutyNameInUrdu}
    />
  ) : (
    <AnonymousCards ref={mehfilCardsRef} dutyName={dutyName} />
  );

  const cardShowDutyNameInUrdu = (
    <Checkbox
      checked={showDutyNameInUrdu}
      onChange={e => setShowDutyNameInUrdu(e.target.checked)}
    >
      Show Urdu Duty Name
    </Checkbox>
  );

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
            content={() => mehfilCardsRef.current}
            trigger={() => (
              <Button size="large" type="primary" icon={<PrinterOutlined />}>
                Print Cards
              </Button>
            )}
          />
          &nbsp;&nbsp;
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
        <div style={InputControlsContainer}>
          {cardShowDutyNameInUrdu}
        </div>
      </div>
      <Divider />
      {cards}
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
  WithMehfilId(),
  WithMehfil(),
  WithDynamicBreadcrumbs(({ mehfil }) => {
    if (mehfil) {
      return `Security, Mehfils, ${mehfil.name}, Mehfil Cards`;
    }
    return `Security, Mehfils, Mehfil Cards`;
  })
)(CardsContainer);
