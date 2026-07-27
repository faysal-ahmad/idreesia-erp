import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
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

const PrintControl = ReactToPrint as any;
const AntButton = Button as any;
const AntCheckbox = Checkbox as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const NamedCardsComponent = NamedCards as any;
const AnonymousCardsComponent = AnonymousCards as any;

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

interface HistoryLike { goBack(): void; }
interface QueryParams { ids?: string; dutyId?: string; }
interface MehfilDuty { _id: string; name?: string; urduName?: string; }
interface CardsData { mehfilKarkunsByIds?: unknown[]; }
interface CardsContainerProps {
  queryParams: QueryParams;
  history: HistoryLike;
  allSecurityMehfilDutiesLoading?: boolean;
  allSecurityMehfilDuties?: MehfilDuty[];
}

const CardsContainer = ({ queryParams: { ids, dutyId }, history, allSecurityMehfilDutiesLoading, allSecurityMehfilDuties = [] }: CardsContainerProps) => {
  const cardsRef = useRef<HTMLElement | null>(null);
  const [showDutyNameInUrdu, setShowDutyNameInUrdu] = useState(false);
  const { data, loading } = useQuery(MEHFIL_KARKUNS_BY_IDS as any, {
    variables: { ids },
  });

  if (loading || allSecurityMehfilDutiesLoading) return null;
  const mehfilDuty = allSecurityMehfilDuties.find(duty => duty._id === dutyId);

  const cards = ids ? (
    <NamedCardsComponent
      ref={cardsRef}
      mehfilKarkunsByIds={(data as CardsData | undefined)?.mehfilKarkunsByIds ?? []}
      showDutyNameInUrdu={showDutyNameInUrdu}
    />
  ) : (
    <AnonymousCardsComponent
      ref={cardsRef}
      mehfilDuty={mehfilDuty}
      showDutyNameInUrdu={showDutyNameInUrdu}
    />
  );

  const cardShowDutyNameInUrdu = (
    <AntCheckbox
      checked={showDutyNameInUrdu}
      onChange={(e: any) => setShowDutyNameInUrdu(e.target.checked)}
    >
      Show Urdu Duty Name
    </AntCheckbox>
  );

  return (
    <>
      <div style={ControlsContainer as any}>
        <div>
          <PrintControl
            content={() => cardsRef.current}
            trigger={() => (
              <AntButton size="large" type="primary" icon={<AntPrinterOutlined />}>
                Print Cards
              </AntButton>
            )}
          />
          &nbsp;&nbsp;
          <AntButton
            size="large"
            type="primary"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </AntButton>
        </div>
        <div style={InputControlsContainer as any}>
          {cardShowDutyNameInUrdu}
        </div>
      </div>
      <AntDivider />
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
  WithDynamicBreadcrumbs(({ mehfil }: { mehfil?: { name?: string } }) => {
    if (mehfil) {
      return `Security, Mehfils, ${mehfil.name}, Print Karkun Cards`;
    }
    return `Security, Mehfils, Print Karkun Cards`;
  })
)(CardsContainer as any);
