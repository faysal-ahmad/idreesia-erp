import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Avatar, Button, Table } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import ListFilter from './list-filter';

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
};

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%'
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allKarkuns: PropTypes.array,
    allDuties: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        if (record.profilePicture) {
          return (
            <div style={NameDivStyle}>
              <Avatar shape="square" size="large" src={record.profilePicture} />
              &nbsp;
              <Link to={`${paths.karkunsPath}/${record._id}`}>{text}</Link>
            </div>
          );
        } else {
          return (
            <div style={NameDivStyle}>
              <Avatar shape="square" size="large" icon="user" />
              &nbsp;
              <Link to={`${paths.karkunsPath}/${record._id}`}>{text}</Link>
            </div>
          );
        }
      }
    },
    {
      title: 'CNIC Number',
      dataIndex: 'cnicNumber',
      key: 'cnicNumber'
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: 'Duties',
      dataIndex: 'duties',
      key: 'duties'
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsNewFormPath);
  };

  getTableHeader = () => {
    const { allDuties } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
          New Karkun
        </Button>
        <ListFilter filterCriteria={{}} allDuties={allDuties} />
      </div>
    );
  };

  render() {
    const { loading, allKarkuns } = this.props;
    if (loading) return null;

    return (
      <Table
        rowKey={'_id'}
        dataSource={allKarkuns}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
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
      address
      profilePicture
      duties
    }
  }
`;

const allDutiesListQuery = gql`
  query allDuties {
    allDuties {
      _id
      name
    }
  }
`;

export default merge(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data })
  }),
  graphql(allDutiesListQuery, {
    props: ({ data }) => ({ ...data })
  }),
  WithBreadcrumbs(['HR', 'Karkuns', 'List'])
)(List);
