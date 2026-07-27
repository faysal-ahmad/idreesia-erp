import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
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
const AntButton = Button as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const KarkunsPrintList = KarkunsList as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { goBack(): void; push(path: string): void; }
interface LocationLike { pathname: string; search: string; }
interface QueryData { hrKarkunsById?: AnyRecord[] | null; }
interface Props { history: HistoryLike; location: LocationLike; }

const PrintView = ({ history, location }: Props) => {
  const karkunsList = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<any>();
  const { queryParams } = useQueryParams({ history, location });

  const { data, loading } = useQuery(HR_KARKUNS_BY_ID as any, {
    variables: {
      _ids: queryParams.karkunIds,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Karkuns', 'Print Karkuns']));
  }, [location]);

  if (loading) return null;

  const { hrKarkunsById } = (data ?? {}) as QueryData;
  return (
    <>
      <ReactToPrintControl
        content={() => karkunsList.current}
        trigger={() => (
          <AntButton size="large" type="primary" icon={<AntPrinterOutlined />}>
            Print Data
          </AntButton>
        )}
      />
      &nbsp;
      <AntButton
        size="large"
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        Back
      </AntButton>
      <AntDivider />
      <KarkunsPrintList ref={karkunsList} karkuns={hrKarkunsById ?? []} />
    </>
  );
};

PrintView.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default PrintView;
