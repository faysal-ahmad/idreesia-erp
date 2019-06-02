import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Divider, Row } from "antd";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { ScanCnic } from "/imports/ui/modules/helpers/controls";
import SearchResult from "./search-result";

class Form extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    cnicNumber: "",
  };

  onCnicCaptured = cnic => {
    this.setState({
      cnicNumber: cnic,
    });
  };

  render() {
    return (
      <Fragment>
        <Row>
          <ScanCnic onCnicCaptured={this.onCnicCaptured} />
        </Row>
        <Row>
          <Divider />
        </Row>
        <Row>
          <SearchResult cnicNumber={this.state.cnicNumber} />
        </Row>
      </Fragment>
    );
  }
}

export default WithBreadcrumbs(["Security", "Visitor Registration"])(Form);
