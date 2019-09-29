import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Table } from '/imports/ui/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allPhysicalStores: PropTypes.array,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.physicalStoresPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresNewFormPath);
  };

  render() {
    const { allPhysicalStores } = this.props;
    return (
      <Table
        rowKey="_id"
        dataSource={allPhysicalStores}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Physical Store
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
      address
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'List'])
)(List);
