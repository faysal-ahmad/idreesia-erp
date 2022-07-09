import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
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
  WithAllMehfilDuties,
} from '/imports/ui/modules/security/common/composers';

import { NamedCards } from './named-cards';
import { AnonymousCards } from './anonymous-cards';
import { MEHFIL_KARKUNS_BY_IDS } from '../../gql'

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

const CardsContainer = ({ queryParams: { ids, dutyId }, history, allSecurityMehfilDutiesLoading, allSecurityMehfilDuties }) => {
  const cardsRef = useRef(null);
  const [showDutyNameInUrdu, setShowDutyNameInUrdu] = useState(false);
  const { data, loading } = useQuery(MEHFIL_KARKUNS_BY_IDS, {
    variables: { ids },
  });

  if (loading || allSecurityMehfilDutiesLoading) return null;
  const mehfilDuty = allSecurityMehfilDuties.find(duty => duty._id === dutyId);

  const cards = ids ? (
    <NamedCards
      ref={cardsRef}
      mehfilKarkunsByIds={data.mehfilKarkunsByIds}
      showDutyNameInUrdu={showDutyNameInUrdu}
    />
  ) : (
    <AnonymousCards
      ref={cardsRef}
      mehfilDuty={mehfilDuty}
      showDutyNameInUrdu={showDutyNameInUrdu}
    />
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
            content={() => cardsRef.current}
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
  allSecurityMehfilDutiesLoading: PropTypes.bool,
  allSecurityMehfilDuties: PropTypes.array,
};

export const MehfilKarkunsPrintCards = flowRight(
  WithAllMehfilDuties(),
  WithQueryParams(),
  WithMehfilId(),
  WithMehfil(),
  WithDynamicBreadcrumbs(({ mehfil }) => {
    if (mehfil) {
      return `Security, Mehfils, ${mehfil.name}, Print Karkun Cards`;
    }
    return `Security, Mehfils, Print Karkun Cards`;
  })
)(CardsContainer);
