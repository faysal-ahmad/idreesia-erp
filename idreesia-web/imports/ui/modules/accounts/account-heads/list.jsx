import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Table } from 'antd';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';
import {
  WithCompanyId,
  WithCompany,
  WithAccountHeadsByCompany,
} from '/imports/ui/modules/accounts/common/composers';
import { treeify } from '/imports/ui/modules/accounts/common/utilities';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    setBreadcrumbs: PropTypes.func,

    companyId: PropTypes.string,
    company: PropTypes.object,
    accountHeadsLoading: PropTypes.bool,
    accountHeadsByCompanyId: PropTypes.array,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        let nameText = `[${record.number}] ${record.name}`;
        if (record.hasChildren) {
          nameText = <b>{`${nameText}`}</b>;
        }

        const url = paths.accountHeadsEditFormPath(
          record.companyId,
          record._id
        );
        return <Link to={url}>{nameText}</Link>;
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  componentDidMount() {
    const { company, setBreadcrumbs } = this.props;
    if (company) {
      setBreadcrumbs([company.name, 'Account Heads', 'List']);
    }
  }

  componentDidUpdate(prevProps) {
    const { company, setBreadcrumbs } = this.props;
    if (prevProps.company !== company) {
      setBreadcrumbs([company.name, 'Account Heads', 'List']);
    }
  }

  render() {
    const { accountHeadsLoading, accountHeadsByCompanyId } = this.props;
    if (accountHeadsLoading) return null;
    const treeDataSource = treeify(accountHeadsByCompanyId);

    return (
      <Table
        rowKey="_id"
        dataSource={treeDataSource}
        columns={this.columns}
        pagination={false}
        bordered
      />
    );
  }
}

export default flowRight(
  WithCompanyId(),
  WithCompany(),
  WithAccountHeadsByCompany(),
  WithBreadcrumbs(['Accounts', 'Account Heads', 'List'])
)(List);
