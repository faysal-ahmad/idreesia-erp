import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "antd";

import CaptureBarcodeForm from "./capture-barcode-form";

export default class CaptureBarcode extends Component {
  static propTypes = {
    onBarcodeCaptured: PropTypes.func,
  };

  state = {
    showForm: false,
  };

  scanBarcode = () => {
    this.setState({ showForm: true });
  };

  handleBarcodeFormCancelled = () => {
    this.setState({ showForm: false });
  };

  onBarcodeCaptured = code => {
    debugger;
    this.setState({ showForm: false });
    const { onBarcodeCaptured } = this.props;
    if (onBarcodeCaptured) {
      onBarcodeCaptured(code);
    }
  };

  render() {
    const { showForm } = this.state;

    return (
      <Fragment>
        <Button type="default" onClick={this.scanBarcode}>
          <Icon type="tag" />Scan Barcode
        </Button>

        <Modal
          visible={showForm}
          title="Capture Barcode"
          footer={null}
          width={550}
          height={550}
          destroyOnClose
          onCancel={this.handleBarcodeFormCancelled}
        >
          <CaptureBarcodeForm onBarcodeCaptured={this.onBarcodeCaptured} />
        </Modal>
      </Fragment>
    );
  }
}
