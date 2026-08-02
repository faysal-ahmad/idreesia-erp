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
import type { MehfilKarkunsByIdsQuery } from 'meteor/idreesia-common/types/client-operations';
import { useMehfil } from '/imports/ui/modules/security/common/composers';

import { List } from './list';
import { MEHFIL_KARKUNS_BY_IDS } from '../../gql';

const ControlsContainer: CSSProperties = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

type MehfilKarkunRow = NonNullable<
  NonNullable<MehfilKarkunsByIdsQuery['mehfilKarkunsByIds']>[number]
>;

type Props = RouteComponentProps;

export const MehfilKarkunsPrintList = ({ history, location }: Props) => {
  const { mehfilId = '' } = useParams<{ mehfilId: string }>();
  const { queryParams } = useQueryParams({ history, location });
  const ids = String(queryParams.ids || '');
  const listRef = useRef<HTMLDivElement>(null);
  const { mehfilById } = useMehfil(mehfilId);
  const { data, loading } = useQuery(MEHFIL_KARKUNS_BY_IDS, {
    skip: !ids,
    variables: { ids },
  });

  useDynamicBreadcrumbs(
    mehfilById?.name
      ? ['Security', 'Mehfils', mehfilById.name, 'Print Karkun List']
      : ['Security', 'Mehfils', 'Print Karkun List']
  );

  if (loading) return null;

  const karkuns = (data?.mehfilKarkunsByIds ?? []).filter(
    (row): row is MehfilKarkunRow => row != null
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
