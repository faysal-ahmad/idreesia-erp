import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu, Icon } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const { Item, SubMenu } = Menu;

const IconStyle = {
  fontSize: '20px',
};

class Sidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
    loading: PropTypes.bool,
    allAccessibleCompanies: PropTypes.array,
  };

  handleMenuItemSelected = ({ item, key }) => {
    const { history, setActiveSubModuleName } = this.props;
    const companyId = item.props['parent-key'];

    if (key.startsWith('account-heads')) {
      setActiveSubModuleName(SubModuleNames.accountHeads);
      history.push(paths.accountHeadsPath(companyId));
    } else if (key.startsWith('activity-sheet')) {
      setActiveSubModuleName(SubModuleNames.activitySheet);
      history.push(paths.activitySheetPath(companyId));
    } else if (key.startsWith('vouchers')) {
      setActiveSubModuleName(SubModuleNames.vouchers);
      history.push(paths.vouchersPath(companyId));
    } else if (key === 'payments') {
      setActiveSubModuleName(SubModuleNames.payments);
      history.push(paths.paymentsPath);
    } else if (key === 'imdad-requests') {
      setActiveSubModuleName(SubModuleNames.imdadRequests);
      history.push(paths.imdadRequestsPath);
    } else if (key === 'payment-types') {
      setActiveSubModuleName(SubModuleNames.paymentTypes);
      history.push(paths.paymentTypesPath);
    } else if (key === 'imdad-reasons') {
      setActiveSubModuleName(SubModuleNames.imdadReasons);
      history.push(paths.imdadReasonsPath);
    } else if (key === 'audit-logs') {
      setActiveSubModuleName(SubModuleNames.auditLogs);
      history.push(paths.auditLogsPath);
    }
  };

  render() {
    const { loading, allAccessibleCompanies } = this.props;
    if (loading) return null;

    const subMenus = [];

    allAccessibleCompanies.forEach(company => {
      subMenus.push(
        <SubMenu
          key={company._id}
          title={
            <span>
              <Icon type="credit-card" style={IconStyle} />
              {company.name}
            </span>
          }
        >
          <Item parent-key={company._id} key={`account-heads-${company._id}`}>
            Account Heads
          </Item>
          <Item parent-key={company._id} key={`activity-sheet-${company._id}`}>
            Activity Sheet
          </Item>
          <Item parent-key={company._id} key={`vouchers-${company._id}`}>
            Vouchers
          </Item>
        </SubMenu>
      );
    });

    return (
      <Menu
        mode="inline"
        style={{ height: '100%', borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
      >
        <Item key="payments">
          <span>
            <Icon type="dollar" style={IconStyle} />
            Payments
          </span>
        </Item>

        <Item key="imdad-requests">
          <span>
            <Icon type="wallet" style={IconStyle} />
            Imdad Requests
          </span>
        </Item>

        {subMenus}
        <SubMenu
          key="administration"
          title={
            <span>
              <Icon type="tool" style={IconStyle} />
              Administration
            </span>
          }
        >
          <Item key="audit-logs">
            <span>
              <Icon type="audit" style={IconStyle} />
              Audit Logs
            </span>
          </Item>
        </SubMenu>
        <SubMenu
          key="setup"
          title={
            <span>
              <Icon type="laptop" style={IconStyle} />
              Setup
            </span>
          }
        >
          <Item key="imdad-reasons">
            <span>
              <Icon type="monitor" style={IconStyle} />
              Imdad Reasons
            </span>
          </Item>
          <Item key="payment-types">
            <span>
              <Icon type="container" style={IconStyle} />
              Payment Types
            </span>
          </Item>
        </SubMenu>
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

const SidebarContainer = flowRight(
  WithActiveModule(),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(Sidebar);
export default SidebarContainer;
