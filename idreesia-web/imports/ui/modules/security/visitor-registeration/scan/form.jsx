import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';
import { Button, Divider, Row, Col, message } from 'antd';
import { SearchOutlined, UnorderedListOutlined, UserAddOutlined } from '@ant-design/icons';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import { ScanCnic } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

class Form extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    cnicNumbers: [],
  };

  onCnicCaptured = cnicNumbers => {
    this.manualCnic.value = '';
    if (cnicNumbers.length === 0) {
      message.error('CNIC number was not recognized.', 3);
    } else {
      this.setState({
        cnicNumbers,
      });
    }
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
    const { cnicNumbers } = this.state;
    const searchResults =
      cnicNumbers.length > 0 ? (
        <SearchResult cnicNumbers={cnicNumbers} />
      ) : null;
    return (
      <Fragment>
        <Row type="flex" justify="space-between">
          <Col order={1}>
            <Row type="flex" justify="start" align="middle" gutter={16}>
              <Col order={1}>Manual CNIC</Col>
              <Col order={2}>
                <InputMask
                  mask="99999-9999999-9"
                  ref={manualCnic => {
                    this.manualCnic = manualCnic;
                  }}
                />
              </Col>
              <Col order={2}>
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => {
                    if (this.manualCnic.value) {
                      this.scanCnic.resetState();
                      this.setState({
                        cnicNumbers: [this.manualCnic.value],
                      });
                    }
                  }}
                />
              </Col>
            </Row>
            <Divider />
            <ScanCnic
              onCnicCaptured={this.onCnicCaptured}
              ref={scanCnic => {
                this.scanCnic = scanCnic;
              }}
            />
          </Col>
          <Col order={2}>
            <Button
              size="large"
              icon={<UnorderedListOutlined />}
              onClick={this.handleSearch}
            >
              Visitors List
            </Button>
            &nbsp;
            <Button
              size="large"
              icon={<UserAddOutlined />}
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
        <Row>{searchResults}</Row>
      </Fragment>
    );
  }
}

export default WithBreadcrumbs(['Security', 'Visitor Registration'])(Form);
