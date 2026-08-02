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
import type { MehfilKarkunsByIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  useMehfil,
  useAllSecurityMehfilDuties,
} from '/imports/ui/modules/security/common/hooks';

import { NamedCards } from './named-cards';
import { AnonymousCards } from './anonymous-cards';
import { MEHFIL_KARKUNS_BY_IDS } from '../../gql';

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

type MehfilKarkunRow = NonNullable<
  NonNullable<MehfilKarkunsByIdsQuery['mehfilKarkunsByIds']>[number]
>;

type Props = RouteComponentProps;

export const MehfilKarkunsPrintCards = ({ history, location }: Props) => {
  const { mehfilId = '' } = useParams<{ mehfilId: string }>();
  const { queryParams } = useQueryParams({ history, location });
  const ids = String(queryParams.ids || '');
  const dutyId = String(queryParams.dutyId || '');
  const cardsRef = useRef<HTMLDivElement>(null);
  const [showDutyNameInUrdu, setShowDutyNameInUrdu] = useState(false);
  const { mehfilById } = useMehfil(mehfilId);
  const {
    allSecurityMehfilDutiesLoading,
    allSecurityMehfilDuties,
  } = useAllSecurityMehfilDuties(mehfilId);
  const { data, loading } = useQuery(MEHFIL_KARKUNS_BY_IDS, {
    skip: !ids,
    variables: { ids },
  });

  useDynamicBreadcrumbs(
    mehfilById?.name
      ? ['Security', 'Mehfils', mehfilById.name, 'Print Karkun Cards']
      : ['Security', 'Mehfils', 'Print Karkun Cards']
  );

  if (loading || allSecurityMehfilDutiesLoading) return null;

  const mehfilDuty = allSecurityMehfilDuties.find((duty) => duty._id === dutyId);
  const mehfilKarkunsByIds = (data?.mehfilKarkunsByIds ?? []).filter(
    (row): row is MehfilKarkunRow => row != null
  );

  const cards = ids ? (
    <NamedCards
      mehfilKarkunsByIds={mehfilKarkunsByIds}
      showDutyNameInUrdu={showDutyNameInUrdu}
    />
  ) : (
    <AnonymousCards
      mehfilDuty={mehfilDuty}
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
