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
    allCompanies: PropTypes.array,
  };

  handleMenuItemSelected = ({ item, key }) => {
    const { history, setActiveSubModuleName } = this.props;
    const companyId = item.props["parent-key"];

    if (key.startsWith("vouchers")) {
      setActiveSubModuleName(SubModuleNames.vouchers);
      history.push(paths.vouchersPath(companyId));
    } else if (key.startsWith("data-imports")) {
      setActiveSubModuleName(SubModuleNames.dataImports);
      history.push(paths.dataImportsPath(companyId));
    }
  };

  render() {
    const { loading, allCompanies } = this.props;
    if (loading) return null;

    const subMenus = [];
    allCompanies.forEach(company => {
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
          <Menu.Item parent-key={company._id} key={`vouchers-${company._id}`}>
            Vouchers
          </Menu.Item>
          <Menu.Item
            parent-key={company._id}
            key={`data-imports-${company._id}`}
          >
            Data Imports
          </Menu.Item>
        </Menu.SubMenu>
      );
    });

    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={["home"]}
        style={{ height: "100%", borderRight: 0 }}
        onSelect={this.handleMenuItemSelected}
      >
        {subMenus}
      </Menu>
    );
  }
}

const listQuery = gql`
  query allCompanies {
    allCompanies {
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
