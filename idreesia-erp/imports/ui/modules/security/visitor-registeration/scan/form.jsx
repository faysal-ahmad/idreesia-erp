import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Divider, Row, Col } from "antd";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";
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

  handleSearch = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationListPath);
  };

  handleNewVisitor = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationNewFormPath);
  };

  render() {
    return (
      <Fragment>
        <Row type="flex" justify="space-between">
          <Col order={1}>
            <ScanCnic onCnicCaptured={this.onCnicCaptured} />
          </Col>
          <Col order={2}>
            <Button size="large" icon="search" onClick={this.handleSearch}>
              Search
            </Button>
            &nbsp;
            <Button
              size="large"
              icon="user-add"
              onClick={this.handleNewVisitor}
            >
              New Visitor Registration
            </Button>
          </Col>
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
