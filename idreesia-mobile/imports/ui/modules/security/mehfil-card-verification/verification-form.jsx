import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Flex, WingBlank, Modal } from 'antd';
import SearchResult from './search-result';
import BarcodeScanner from './barcode-scanner';

const ColStyle = { paddingLeft: '10px', paddingRight: '10px' };

export default class VerificationForm extends Component {
  static propTypes = {
    onBarcodeCaptured: PropTypes.func,
  };

  state = {
    showForm: false,
    barcode: null,
  };

  scanBarcode = () => {
    this.setState({ showForm: true });
  };

  handleBarcodeFormCancelled = () => {
    this.setState({ showForm: false });
  };

  onBarcodeCaptured = code => {
    this.setState({
      showForm: false,
      barcode: code,
    });
  };

  render() {
    const { barcode, showForm } = this.state;
    const searchResult = barcode ? <SearchResult barcode={barcode} /> : null;
    const modal = showForm ? (
      <Modal
        closable
        popup
        animationType="slide-down"
        visible={showForm}
        onClose={this.handleBarcodeFormCancelled}
      >
        <BarcodeScanner onBarcodeCaptured={this.onBarcodeCaptured} />
      </Modal>
    ) : null;

    return (
      <Flex direction="column" justify="center" align="center" style={ColStyle}>
        <WingBlank>
          <Button type="default" onClick={this.scanBarcode}>
            Start Scanning
          </Button>
        </WingBlank>
        {searchResult}
        {modal}
      </Flex>
    );
  }
}
