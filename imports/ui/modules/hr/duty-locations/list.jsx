import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Icon, Table } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allDutyLocations: PropTypes.array,
    removeDutyLocation: PropTypes.func
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.dutyLocationsPath}/${record._id}`}>{text}</Link>
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.usedCount === 0) {
          return (
            <span>
              <a href="javascript:;">
                <Icon
                  type="delete"
                  onClick={() => {
                    this.handleDeleteClicked(record);
                  }}
                />
              </a>
            </span>
          );
        }
        return null;
      }
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.dutyLocationsNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeDutyLocation } = this.props;
    removeDutyLocation({
      variables: {
        _id: record._id
      }
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allDutyLocations } = this.props;

    return (
      <Table
        rowKey={'_id'}
        dataSource={allDutyLocations}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Duty Location
            </Button>
          );
        }}
      />
    );
  }
}

const listQuery = gql`
  query allDutyLocations {
    allDutyLocations {
      _id
      name
      usedCount
    }
  }
`;

const removeDutyLocationMutation = gql`
  mutation removeDutyLocation($_id: String!) {
    removeDutyLocation(_id: $_id)
  }
`;

export default merge(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data })
  }),
  graphql(removeDutyLocationMutation, {
    name: 'removeDutyLocation',
    options: {
      refetchQueries: ['allDutyLocations']
    }
  }),
  WithBreadcrumbs(['HR', 'Setup', 'Duty Locations', 'List'])
)(List);
