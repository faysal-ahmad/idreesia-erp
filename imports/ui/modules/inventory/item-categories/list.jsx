import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Table } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allItemCategories: PropTypes.array,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.itemCategoriesPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Item Types Count',
      dataIndex: 'itemTypeCount',
      key: 'itemTypeCount',
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.itemCategoriesNewFormPath);
  };

  render() {
    const { allItemCategories } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allItemCategories}
        columns={this.columns}
        bordered
        title={() => (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Item Category
            </Button>
          )}
      />
    );
  }
}

const listQuery = gql`
  query allItemCategories {
    allItemCategories {
      _id
      name
      itemTypeCount
    }
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'List'])
)(List);
