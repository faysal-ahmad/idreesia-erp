import React, { useRef } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider, Spin } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

const ReactToPrintControl = ReactToPrint as any;

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import { HR_KARKUNS_BY_ID } from '../../gql';
import KarkunsList from './karkuns-list';

type Props = RouteComponentProps;

const PrintView = ({ history, location }: Props) => {
  const karkunsListRef = useRef<HTMLDivElement | null>(null);
  useDynamicBreadcrumbs(['HR', 'Employees', 'Print List']);
  const { queryParams } = useQueryParams({ history, location });

  const { data, loading } = useQuery(HR_KARKUNS_BY_ID, {
    variables: {
      _ids: String(queryParams.karkunIds ?? ''),
    },
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const hrKarkunsById = (data?.hrKarkunsById ?? []).filter(
    (karkun): karkun is NonNullable<typeof karkun> => karkun != null
  );

  return (
    <>
      <ReactToPrintControl
        content={() => karkunsListRef.current}
        trigger={() => (
          <Button size="large" type="primary" icon={<PrinterOutlined />}>
            Print Data
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
      <div ref={karkunsListRef}>
        <KarkunsList karkuns={hrKarkunsById} />
      </div>
    </>
  );
};

export default PrintView;
