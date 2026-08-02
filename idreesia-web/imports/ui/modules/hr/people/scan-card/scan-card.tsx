import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { Divider, Row } from 'antd';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';

import SearchResult from './search-result';

type Props = RouteComponentProps;

const ScanCard = ({ history, location }: Props) => {
  useBreadcrumbs(['HR', 'Karkuns', 'Scan Card']);
  const { queryParams } = useQueryParams({ history, location });
  const cardId = queryParams.cardId ? String(queryParams.cardId) : undefined;

  const onBarcodeCaptured = (code: string) => {
    history.push(`${paths.karkunsScanCardPath}?cardId=${code}`);
  };

  return (
    <>
      <Row>
        <ScanBarcode onBarcodeCaptured={onBarcodeCaptured} />
      </Row>
      <Row>
        <Divider />
      </Row>
      <Row>{cardId ? <SearchResult barcode={cardId} /> : null}</Row>
    </>
  );
};

export default ScanCard;
