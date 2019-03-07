import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import { compose } from "react-apollo";
import { sortBy } from "lodash";

import { WithBreadcrumbs } from "/imports/ui/composers";
import {
  WithCompanyId,
  WithCompany,
  WithAccountHeadsByCompany,
} from "/imports/ui/modules/accounts/common/composers";

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
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        if (record.children) {
          return <b>{`[${record.number}] ${record.name}`}</b>;
        }

        return `[${record.number}] ${record.name}`;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  componentDidUpdate(prevProps) {
    const { company, setBreadcrumbs } = this.props;
    if (prevProps.company !== company) {
      setBreadcrumbs([company.name, "Accounts", "Account Heads", "List"]);
    }
  }

  treeify(
    list,
    idAttr = "number",
    parentAttr = "parent",
    childrenAttr = "children"
  ) {
    const sortedList = sortBy(list, "number");
    const treeList = [];
    const lookup = {};
    sortedList.forEach(obj => {
      lookup[obj[idAttr]] = obj;
      // eslint-disable-next-line no-param-reassign
      obj[childrenAttr] = [];
    });

    sortedList.forEach(obj => {
      if (obj[parentAttr] !== 0) {
        lookup[obj[parentAttr]][childrenAttr].push(obj);
      } else {
        treeList.push(obj);
      }
    });

    sortedList.forEach(obj => {
      if (obj[childrenAttr].length === 0) {
        // eslint-disable-next-line no-param-reassign
        delete obj[childrenAttr];
      }
    });

    return treeList;
  }

  render() {
    const { accountHeadsLoading, accountHeadsByCompanyId } = this.props;
    if (accountHeadsLoading) return null;
    const treeDataSource = this.treeify(accountHeadsByCompanyId);

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

export default compose(
  WithCompanyId(),
  WithCompany(),
  WithAccountHeadsByCompany(),
  WithBreadcrumbs(["Accounts", "Account Heads", "List"])
)(List);
