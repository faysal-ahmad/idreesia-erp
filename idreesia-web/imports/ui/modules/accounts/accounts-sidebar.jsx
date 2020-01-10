import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu, Icon } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

class AccountsSidebar extends Component {
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
    } else if (key === 'amaanat-logs') {
      setActiveSubModuleName(SubModuleNames.amaanatLogs);
      history.push(paths.amaanatLogsPath);
    } else if (key === 'payments') {
      setActiveSubModuleName(SubModuleNames.payments);
      history.push(paths.paymentsPath);
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
    subMenus.push(
      <Menu.Item key="payments">
        <span>
          <Icon type="bars" />
          Payments
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
        style={{ height: '100%', borderRight: 0 }}
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

const AdminSidebarContainer = flowRight(
  WithActiveModule(),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(AccountsSidebar);
export default AdminSidebarContainer;
