import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';
import { Button, Divider, Row, Col, message } from 'antd';
import { SearchOutlined, UnorderedListOutlined, UserAddOutlined } from '@ant-design/icons';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import { ScanCnic } from '/imports/ui/modules/helpers/controls';
import SearchResult from './search-result';

const ReactFragment = Fragment as any;
const MaskedInput = InputMask as any;
const AntButton = Button as any;
const AntDivider = Divider as any;
const AntRow = Row as any;
const AntCol = Col as any;
const AntSearchOutlined = SearchOutlined as any;
const AntUnorderedListOutlined = UnorderedListOutlined as any;
const AntUserAddOutlined = UserAddOutlined as any;
const ScanCnicControl = ScanCnic as any;
const SearchResultComponent = SearchResult as any;
interface HistoryLike { push(path: string): void; }
interface FormProps { history: HistoryLike; }
interface FormState { cnicNumbers: string[]; }

class Form extends Component<FormProps, FormState> {
  manualCnic: any;
  scanCnic: any;
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    cnicNumbers: [],
  };

  onCnicCaptured = (cnicNumbers: string[]) => {
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
        <SearchResultComponent cnicNumbers={cnicNumbers} />
      ) : null;
    return (
      <ReactFragment>
        <AntRow type="flex" justify="space-between">
          <AntCol order={1}>
            <AntRow type="flex" justify="start" align="middle" gutter={16}>
              <AntCol order={1}>Manual CNIC</AntCol>
              <AntCol order={2}>
                <MaskedInput
                  mask="99999-9999999-9"
                  ref={(manualCnic: any) => {
                    this.manualCnic = manualCnic;
                  }}
                />
              </AntCol>
              <AntCol order={2}>
                <AntButton
                  icon={<AntSearchOutlined />}
                  onClick={() => {
                    if (this.manualCnic.value) {
                      this.scanCnic.resetState();
                      this.setState({
                        cnicNumbers: [this.manualCnic.value],
                      });
                    }
                  }}
                />
              </AntCol>
            </AntRow>
            <AntDivider />
            <ScanCnicControl
              onCnicCaptured={this.onCnicCaptured}
              ref={(scanCnic: any) => {
                this.scanCnic = scanCnic;
              }}
            />
          </AntCol>
          <AntCol order={2}>
            <AntButton
              size="large"
              icon={<AntUnorderedListOutlined />}
              onClick={this.handleSearch}
            >
              Visitors List
            </AntButton>
            &nbsp;
            <AntButton
              size="large"
              icon={<AntUserAddOutlined />}
              type="primary"
              onClick={this.handleNewVisitor}
            >
              New Visitor Registration
            </AntButton>
          </AntCol>
        </AntRow>
        <AntRow>
          <AntDivider />
        </AntRow>
        <AntRow>{searchResults}</AntRow>
      </ReactFragment>
    );
  }
}

export default WithBreadcrumbs(['Security', 'Visitor Registration'])(Form as any);
