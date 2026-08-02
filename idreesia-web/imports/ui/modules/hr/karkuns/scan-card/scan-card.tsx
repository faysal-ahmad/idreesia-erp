import React from 'react';
import { type RouteComponentProps } from 'react-router';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { Divider, Row } from 'antd';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

type Props = RouteComponentProps;

const ScanCard = ({ history, location }: Props) => {
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['HR', 'Karkuns', 'Scan Card']);

  const onBarcodeCaptured = (code: string) => {
    history.push(`${paths.karkunsScanCardPath}?cardId=${code}`);
  };

  const cardId = queryParams.cardId as string | undefined;

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
