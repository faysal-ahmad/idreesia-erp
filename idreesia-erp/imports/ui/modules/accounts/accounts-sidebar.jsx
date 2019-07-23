import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Menu, Icon } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { GlobalActionsCreator } from "/imports/ui/action-creators";
import SubModuleNames from "./submodule-names";
import { default as paths } from "./submodule-paths";

class AccountsSidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    setActiveSubModuleName: PropTypes.func,

    loading: PropTypes.bool,
    allAccessibleCompanies: PropTypes.array,
  };

  handleMenuItemSelected = ({ item, key }) => {
    const { history, setActiveSubModuleName } = this.props;
    const companyId = item.props["parent-key"];

    if (key.startsWith("account-heads")) {
      setActiveSubModuleName(SubModuleNames.accountHeads);
      history.push(paths.accountHeadsPath(companyId));
    } else if (key.startsWith("activity-sheet")) {
      setActiveSubModuleName(SubModuleNames.activitySheet);
      history.push(paths.activitySheetPath(companyId));
    } else if (key.startsWith("vouchers")) {
      setActiveSubModuleName(SubModuleNames.vouchers);
      history.push(paths.vouchersPath(companyId));
    } else if (key === "amaanat-logs") {
      setActiveSubModuleName(SubModuleNames.amaanatLogs);
      history.push(paths.amaanatLogsPath);
    }
  };

  render() {
    const { loading, allAccessibleCompanies } = this.props;
    if (loading) return null;

    const subMenus = [];
    subMenus.push(
      <Menu.Item key="amaanat-logs">
        <span>
          <Icon type="bars" />
          Amaanat Logs
        </span>
      </Menu.Item>
    );

    allAccessibleCompanies.forEach(company => {
      subMenus.push(
        <Menu.SubMenu
          key={company._id}
          title={
            <span>
              <Icon type="credit-card" />
              {company.name}
            </span>
          }
        >
          <Menu.Item
            parent-key={company._id}
            key={`account-heads-${company._id}`}
          >
            Account Heads
          </Menu.Item>
          <Menu.Item
            parent-key={company._id}
            key={`activity-sheet-${company._id}`}
          >
            Activity Sheet
          </Menu.Item>
          <Menu.Item parent-key={company._id} key={`vouchers-${company._id}`}>
            Vouchers
          </Menu.Item>
        </Menu.SubMenu>
      );
    });

    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={["home"]}
        style={{ height: "100%", borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
      >
        {subMenus}
      </Menu>
    );
  }
}

const listQuery = gql`
  query allAccessibleCompanies {
    allAccessibleCompanies {
      _id
      name
    }
  }
`;

const mapDispatchToProps = dispatch => ({
  setActiveSubModuleName: subModuleName => {
    dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
  },
});

const AdminSidebarContainer = compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  connect(null, mapDispatchToProps)
)(AccountsSidebar);
export default AdminSidebarContainer;
