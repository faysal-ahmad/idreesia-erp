import React, { useEffect, useRef } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';

import { HR_KARKUNS_BY_ID } from '../../gql';
import KarkunsList from './karkuns-list';

const ReactToPrintControl = ReactToPrint as any;

type Props = RouteComponentProps;

const PrintView = ({ history, location }: Props) => {
  const karkunsList = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const { queryParams } = useQueryParams({ history, location });

  const { data, loading } = useQuery(HR_KARKUNS_BY_ID, {
    variables: {
      _ids: (queryParams.karkunIds as string) ?? '',
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Karkuns', 'Print Karkuns']));
  }, [dispatch, location]);

  if (loading) return null;

  const hrKarkunsById = data?.hrKarkunsById ?? [];
  return (
    <>
      <ReactToPrintControl
        content={() => karkunsList.current}
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
      <div ref={karkunsList}>
        <KarkunsList karkuns={hrKarkunsById} />
      </div>
    </>
  );
};

export default PrintView;
