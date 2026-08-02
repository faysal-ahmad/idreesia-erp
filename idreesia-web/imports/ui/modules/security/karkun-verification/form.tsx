import React from 'react';
import { type RouteComponentProps } from 'react-router';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import { Divider, Row } from 'antd';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

const Form = ({ history, location }: RouteComponentProps) => {
  useBreadcrumbs(['Security', 'Karkun Card Verification']);
  const { queryParams } = useQueryParams({ history, location });
  const cardId = String(queryParams.cardId || '');

  const onBarcodeCaptured = (code: string) => {
    history.push(`${paths.karkunCardVerificationPath}?cardId=${code}`);
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

export default Form;
