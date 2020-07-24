import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Divider, Input, Row, Col } from '/imports/ui/controls';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';
import SearchResults from './search-results';

class Form extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    cnicNumbers: [],
    partialCnicNumber: null,
  };

  handleList = () => {
    const { history } = this.props;
    history.push(paths.visitorsPath);
  };

  handleNewVisitor = () => {
    const { history } = this.props;
    history.push(paths.visitorsNewFormPath);
  };

  render() {
    const { cnicNumbers, partialCnicNumber } = this.state;
    const searchResults =
      cnicNumbers.length > 0 || partialCnicNumber ? (
        <SearchResults
          cnicNumbers={cnicNumbers}
          partialCnicNumber={partialCnicNumber}
        />
      ) : null;
    return (
      <Fragment>
        <Row type="flex" justify="space-between">
          <Col order={1}>
            <Row type="flex" justify="start" align="middle" gutter={16}>
              <Col order={1}>Manual CNIC</Col>
              <Col order={2}>
                <Input
                  addonBefore="##### -"
                  addonAfter="- #"
                  ref={manualCnic => {
                    this.manualCnic = manualCnic;
                  }}
                />
              </Col>
              <Col order={2}>
                <Button
                  icon="search"
                  onClick={() => {
                    this.setState({
                      partialCnicNumber: this.manualCnic.state.value,
                    });
                  }}
                />
              </Col>
            </Row>
          </Col>
          <Col order={2}>
            <Button
              size="large"
              icon="unordered-list"
              onClick={this.handleList}
            >
              Visitors List
            </Button>
            &nbsp;
            <Button
              size="large"
              icon="user-add"
              type="primary"
              onClick={this.handleNewVisitor}
            >
              New Visitor Registration
            </Button>
          </Col>
        </Row>
        <Row>
          <Divider />
        </Row>
        {searchResults}
      </Fragment>
    );
  }
}

export default WithBreadcrumbs(['Operations', 'Visitor Search'])(Form);
