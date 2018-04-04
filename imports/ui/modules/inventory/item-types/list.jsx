import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Checkbox, Table } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allItemTypes: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.itemTypesPath}/${record._id}`}>{text}</Link>
    },
    {
      title: 'Category',
      dataIndex: 'itemCategoryName',
      key: 'itemCategoryName'
    },
    {
      title: 'Measurement Unit',
      dataIndex: 'formattedUOM',
      key: 'formattedUOM'
    },
    {
      title: 'Single Use',
      dataIndex: 'singleUse',
      key: 'singleUse',
      render: (value, record) => <Checkbox checked={value} disabled />
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.itemTypesNewFormPath);
  };

  render() {
    const { allItemTypes } = this.props;
    return (
      <Table
        rowKey={'_id'}
        dataSource={allItemTypes}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleTakePicture}>
              New Item Type
            </Button>
          );
        }}
      />
    );
  }
}

const listQuery = gql`
  query allItemTypes {
    allItemTypes {
      _id
      name
      description
      singleUse
      formattedUOM
      itemCategoryName
    }
  }
`;

export default merge(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data })
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Types', 'List'])
)(List);
