import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { Button, Flex, WingBlank } from 'antd';
import SearchResult from './search-result';

const ColStyle = { paddingLeft: '10px', paddingRight: '10px' };

const SCANNER_CONFIG = {
  preferFrontCamera: false,
  showFlipCameraButton: true,
  showTorchButton: true,
  prompt: 'Place a barcode inside the scan area',
  resultDisplayDuration: 500,
  formats: 'CODE128B',
  disableAnimations: true,
  disableSuccessBeep: false,
};

const VerificationForm = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams } = useQueryParams({ history, location });
  const [barcode, setBarcode] = useState(null);
  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'Karkun Card Verification']));
    if (queryParams.barcode) {
      setBarcode(queryParams.barcode);
    }
  }, [location]);

  const scanBarcode = () => {
    const scan = window?.cordova?.plugins?.barcodeScanner?.scan;
    if (scan) {
      scan(
        result => {
          const scannedBarcode = result.text;
          setBarcode(scannedBarcode);
          console.log(`Scanned barcode - ${scannedBarcode}`);
        },
        error => {
          console.error('Scanning failed', error);
        },
        SCANNER_CONFIG
      );
    }
  };

  const searchResult = barcode ? <SearchResult barcode={barcode} /> : null;

  return (
    <Flex direction="column" justify="center" align="center" style={ColStyle}>
      <WingBlank style={{ width: '100%' }}>
        <Button type="default" onClick={scanBarcode}>
          Scan Card
        </Button>
      </WingBlank>
      {searchResult}
    </Flex>
  );
};

VerificationForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default VerificationForm;
