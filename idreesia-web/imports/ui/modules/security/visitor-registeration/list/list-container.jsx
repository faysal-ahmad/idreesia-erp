import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Drawer } from '/imports/ui/controls';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import List from './list';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';
import { VisitorMulakaatsList } from '/imports/ui/modules/security/visitor-mulakaats';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  state = {
    pageIndex: 0,
    pageSize: 20,
    name: '',
    cnicNumber: '',
    phoneNumber: '',
    additionalInfo: '',
    showStayList: false,
    visitorIdForStayList: null,
    showMulakaatList: false,
    visitorIdForMulakaatList: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationNewFormPath);
  };

  handleUploadClicked = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationUploadFormPath);
  };

  handleScanClicked = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationPath);
  };

  handleItemSelected = visitor => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  handleShowStayList = visitor => {
    this.setState({
      showStayList: true,
      visitorIdForStayList: visitor._id,
    });
  };

  handleShowMulakaatList = visitor => {
    this.setState({
      showMulakaatList: true,
      visitorIdForMulakaatList: visitor._id,
    });
  };

  handleStayListClose = () => {
    this.setState({
      showStayList: false,
      visitorIdForStayList: null,
    });
  };

  handleMulakaatListClose = () => {
    this.setState({
      showMulakaatList: false,
      visitorIdForMulakaatList: null,
    });
  };

  render() {
    const {
      showStayList,
      visitorIdForStayList,
      showMulakaatList,
      visitorIdForMulakaatList,
    } = this.state;
    const {
      pageIndex,
      pageSize,
      name,
      cnicNumber,
      phoneNumber,
      additionalInfo,
    } = this.state;

    return (
      <>
        <List
          pageIndex={pageIndex}
          pageSize={pageSize}
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          additionalInfo={additionalInfo}
          setPageParams={this.setPageParams}
          handleItemSelected={this.handleItemSelected}
          handleShowStayList={this.handleShowStayList}
          handleShowMulakaatList={this.handleShowMulakaatList}
          showNewButton
          handleNewClicked={this.handleNewClicked}
          handleUploadClicked={this.handleUploadClicked}
          handleScanClicked={this.handleScanClicked}
        />
        <Drawer
          title="Stay History"
          width={600}
          onClose={this.handleStayListClose}
          visible={showStayList}
        >
          <VisitorStaysList
            showNewButton
            showActionsColumn
            visitorId={visitorIdForStayList}
          />
        </Drawer>
        <Drawer
          title="Mulakaat History"
          width={400}
          onClose={this.handleMulakaatListClose}
          visible={showMulakaatList}
        >
          <VisitorMulakaatsList
            showNewButton
            showActionsColumn
            visitorId={visitorIdForMulakaatList}
          />
        </Drawer>
      </>
    );
  }
}

export default WithBreadcrumbs(['Security', 'Visitor Registration', 'List'])(
  ListContainer
);
