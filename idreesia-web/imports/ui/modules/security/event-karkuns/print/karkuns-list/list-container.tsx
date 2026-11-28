import React, { useRef, type CSSProperties } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { SecurityEventKarkunsByIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import { useEvent } from '/imports/ui/modules/security/common/hooks';

import { List } from './list';
import { SECURITY_EVENT_KARKUNS_BY_IDS } from '../../gql';

const ControlsContainer: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

type EventKarkunRow = NonNullable<
  NonNullable<SecurityEventKarkunsByIdsQuery['securityEventKarkunsByIds']>[number]
>;

type Props = RouteComponentProps;

export const EventKarkunsPrintList = ({ history, location }: Props) => {
  const { eventId = '' } = useParams<{ eventId: string }>();
  const { queryParams } = useQueryParams({ history, location });
  const ids = String(queryParams.ids || '');
  const listRef = useRef<HTMLDivElement>(null);
  const { securityEventById } = useEvent(eventId);
  const { data, loading } = useQuery(SECURITY_EVENT_KARKUNS_BY_IDS, {
    skip: !ids,
    variables: { ids },
  });

  useDynamicBreadcrumbs(
    securityEventById?.name
      ? ['Security', 'Events', securityEventById.name, 'Print Karkun List']
      : ['Security', 'Events', 'Print Karkun List']
  );

  if (loading) return null;

  const karkuns = (data?.securityEventKarkunsByIds ?? []).filter(
    (row): row is EventKarkunRow => row != null
  );

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
            content={() => listRef.current!}
            trigger={() => (
              <Button size="large" type="primary" icon={<PrinterOutlined />}>
                Print List
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
      </div>
      <Divider />
      <div ref={listRef}>
        <List karkuns={karkuns} />
      </div>
    </>
  );
};
