import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar, Button, Checkbox, Table } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    allItemTypes: PropTypes.array,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        if (record.picture) {
          return (
            <div style={NameDivStyle}>
              <Avatar shape="square" size="large" src={record.picture} />
              &nbsp;
              <Link to={`${paths.itemTypesPath}/${record._id}`}>{text}</Link>
            </div>
          );
        }

        return (
          <div style={NameDivStyle}>
            <Avatar shape="square" size="large" icon="picture" />
            &nbsp;
            <Link to={`${paths.itemTypesPath}/${record._id}`}>{text}</Link>
          </div>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'itemCategoryName',
      key: 'itemCategoryName',
    },
    {
      title: 'Measurement Unit',
      dataIndex: 'formattedUOM',
      key: 'formattedUOM',
    },
    {
      title: 'Single Use',
      dataIndex: 'singleUse',
      key: 'singleUse',
      render: value => <Checkbox checked={value} disabled />,
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.itemTypesNewFormPath);
  };

  render() {
    const { loading, allItemTypes } = this.props;
    if (loading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={allItemTypes}
        columns={this.columns}
        bordered
        title={() => (
          <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
            New Item Type
          </Button>
        )}
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
      picture
    }
  }
`;

export default compose(
  graphql(listQuery, {
    options: {
      errorPolicy: 'all',
    },
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Types', 'List'])
)(List);
