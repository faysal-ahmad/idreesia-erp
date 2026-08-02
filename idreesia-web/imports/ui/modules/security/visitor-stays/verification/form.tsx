import React, { Fragment, useState } from 'react';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { Divider, Row } from 'antd';
import { ScanBarcode } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

const Form = () => {
  useBreadcrumbs(['Security', 'Visitor Card Verification']);
  const [barcode, setBarcode] = useState('');

  const onBarcodeCaptured = (code: string) => {
    setBarcode(code);
  };

  return (
    <Fragment>
      <Row>
        <ScanBarcode onBarcodeCaptured={onBarcodeCaptured} />
      </Row>
      <Row>
        <Divider />
      </Row>
      <Row>
        <SearchResult barcode={barcode} />
      </Row>
    </Fragment>
  );
};

export default Form;
