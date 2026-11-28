import React, { useRef, useState, type CSSProperties } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import ReactToPrint from 'react-to-print';
import { Button, Checkbox, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { SecurityEventKarkunsByIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  useEvent,
  useAllSecurityEventDuties,
} from '/imports/ui/modules/security/common/hooks';

import { NamedCards } from './named-cards';
import { AnonymousCards } from './anonymous-cards';
import { SECURITY_EVENT_KARKUNS_BY_IDS } from '../../gql';

const ControlsContainer: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

const InputControlsContainer: CSSProperties = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'flex-start',
};

type EventKarkunRow = NonNullable<
  NonNullable<SecurityEventKarkunsByIdsQuery['securityEventKarkunsByIds']>[number]
>;

type Props = RouteComponentProps;

export const EventKarkunsPrintCards = ({ history, location }: Props) => {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const { queryParams } = useQueryParams({ history, location });
  const ids = String(queryParams.ids || '');
  const dutyId = String(queryParams.dutyId || '');
  const cardsRef = useRef<HTMLDivElement>(null);
  const [showDutyNameInUrdu, setShowDutyNameInUrdu] = useState(false);
  const { securityEventById } = useEvent(eventId);
  const {
    allSecurityEventDutiesLoading,
    allSecurityEventDuties,
  } = useAllSecurityEventDuties(eventId);
  const { data, loading } = useQuery(SECURITY_EVENT_KARKUNS_BY_IDS, {
    skip: !ids,
    variables: { ids },
  });

  useDynamicBreadcrumbs(
    securityEventById?.name
      ? ['Security', 'Events', securityEventById.name, 'Print Karkun Cards']
      : ['Security', 'Events', 'Print Karkun Cards']
  );

  if (loading || allSecurityEventDutiesLoading) return null;

  const eventDuty = allSecurityEventDuties.find((duty) => duty._id === dutyId);
  const securityEventKarkunsByIds = (data?.securityEventKarkunsByIds ?? []).filter(
    (row): row is EventKarkunRow => row != null
  );

  const cards = ids ? (
    <NamedCards
      securityEventKarkunsByIds={securityEventKarkunsByIds}
      showDutyNameInUrdu={showDutyNameInUrdu}
    />
  ) : (
    <AnonymousCards
      eventDuty={eventDuty}
      showDutyNameInUrdu={showDutyNameInUrdu}
    />
  );

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
            content={() => cardsRef.current!}
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
          <Checkbox
            checked={showDutyNameInUrdu}
            onChange={(e) => setShowDutyNameInUrdu(e.target.checked)}
          >
            Show Urdu Duty Name
          </Checkbox>
        </div>
      </div>
      <Divider />
      <div ref={cardsRef}>{cards}</div>
    </>
  );
};
