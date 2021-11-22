import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Button, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allCompanies: PropTypes.array,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.companiesPath}/${record._id}`}>{text}</Link>
      ),
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.companiesNewFormPath);
  };

  render() {
    const { allCompanies } = this.props;
    return (
      <Table
        rowKey="_id"
        dataSource={allCompanies}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={this.handleNewClicked}
          >
            New Company
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allCompanies {
    allCompanies {
      _id
      name
      importData
      connectivitySettings
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Companies', 'List'])
)(List);
