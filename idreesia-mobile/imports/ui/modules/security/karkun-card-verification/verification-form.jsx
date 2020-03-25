import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { Button, Flex, WingBlank } from '/imports/ui/controls';
import SearchResult from './search-result';

const ColStyle = { paddingLeft: '10px', paddingRight: '10px' };

const SCANNER_CONFIG = {
  preferFrontCamera: false, // iOS and Android
  showFlipCameraButton: true, // iOS and Android
  showTorchButton: true, // iOS and Android
  prompt: 'Place a barcode inside the scan area', // Android
  resultDisplayDuration: 500, // Android, display lead text for X ms. 0 suppresses it entirely, default 1500
  formats: 'CODE128B',
  disableAnimations: true, // iOS
  disableSuccessBeep: false, // iOS and Android
};

const VerificationForm = ({ history, location }) => {
  const { queryParams } = useQueryParams({ history, location });
  const [barcode, setBarcode] = useState(null);
  useEffect(() => {
    if (queryParams.barcode) {
      setBarcode(queryParams.barcode);
    }
  }, [location]);

  const scanBarcode = () => {
    window.cordova.plugins.barcodeScanner.scan(
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
  };

  const searchResult = barcode ? <SearchResult barcode={barcode} /> : null;

  return (
    <Flex direction="column" justify="center" align="center" style={ColStyle}>
      <WingBlank>
        <Button type="default" onClick={scanBarcode}>
          Start Scanning
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
