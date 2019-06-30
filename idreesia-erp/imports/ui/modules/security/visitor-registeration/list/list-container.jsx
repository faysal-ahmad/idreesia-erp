import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Drawer } from "antd";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";

import List from "./list";
import { VisitorStaysList } from "/imports/ui/modules/security/visitor-stays";

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
    name: null,
    cnicNumber: null,
    phoneNumber: null,
    showStayList: false,
    visitorIdForStayList: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationNewFormPath);
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

  handleStayListClose = () => {
    this.setState({
      showStayList: false,
    });
  };

  render() {
    const { visitorIdForStayList } = this.state;
    const { pageIndex, pageSize, name, cnicNumber, phoneNumber } = this.state;

    return (
      <Fragment>
        <List
          pageIndex={pageIndex}
          pageSize={pageSize}
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          setPageParams={this.setPageParams}
          handleItemSelected={this.handleItemSelected}
          handleShowStayList={this.handleShowStayList}
          showNewButton
          handleNewClicked={this.handleNewClicked}
          handleScanClicked={this.handleScanClicked}
        />
        <Drawer
          title="Stay History"
          width={600}
          onClose={this.handleStayListClose}
          visible={this.state.showStayList}
          style={{
            overflow: "auto",
            height: "calc(100% - 108px)",
            paddingBottom: "108px",
          }}
        >
          <VisitorStaysList visitorId={visitorIdForStayList} />
        </Drawer>
      </Fragment>
    );
  }
}

export default WithBreadcrumbs(["Security", "Visitor Registration", "List"])(
  ListContainer
);
