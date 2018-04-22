import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allKarkuns: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.karkunsPath}/${record._id}`}>{text}</Link>
    },
    {
      title: 'CNIC Number',
      dataIndex: 'cnicNumber',
      key: 'cnicNumber'
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsNewFormPath);
  };

  render() {
    const { allKarkuns } = this.props;

    return (
      <Table
        rowKey={'_id'}
        dataSource={allKarkuns}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Karkun
            </Button>
          );
        }}
      />
    );
  }
}

const listQuery = gql`
  query allKarkuns {
    allKarkuns {
      _id
      name
      firstName
      lastName
      cnicNumber
    }
  }
`;

export default merge(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data })
  }),
  WithBreadcrumbs(['HR', 'Karkuns', 'List'])
)(List);
