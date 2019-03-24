import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Row } from "antd";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { CaptureBarcode } from "/imports/ui/modules/helpers/controls";
import SearchResult from "./search/search-result";

class Search extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    barcode: "",
  };

  onBarcodeCaptured = code => {
    this.setState({
      barcode: code,
    });
  };

  render() {
    return (
      <Fragment>
        <Row>
          <CaptureBarcode onBarcodeCaptured={this.onBarcodeCaptured} />
        </Row>
        <Row>
          <SearchResult barcode={this.state.barcode} />
        </Row>
      </Fragment>
    );
  }
}

export default WithBreadcrumbs(["HR", "Karkuns", "Search"])(Search);