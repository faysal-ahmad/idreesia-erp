import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allSecurityMehfilLangarLocations: PropTypes.array,
    removeSecurityMehfilLangarLocation: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.mehfilLangarLocationsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Urdu Name',
      dataIndex: 'urduName',
      key: 'urduName',
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.overallUsedCount === 0) {
          return (
            <Tooltip title="Delete">
              <DeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  this.handleDeleteClicked(record);
                }}
              />
            </Tooltip>
          );
        }
        return null;
      },
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.mehfilLangarLocationsNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeSecurityMehfilLangarLocation } = this.props;
    removeSecurityMehfilLangarLocation({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allSecurityMehfilLangarLocations } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allSecurityMehfilLangarLocations}
        columns={this.columns}
        pagination={{ defaultPageSize: 20 }}
        bordered
        title={() => (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={this.handleNewClicked}
          >
            New Langar Location
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allSecurityMehfilLangarLocations {
    allSecurityMehfilLangarLocations {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

const removeSecurityMehfilLangarLocationMutation = gql`
  mutation removeSecurityMehfilLangarLocation($_id: String!) {
    removeSecurityMehfilLangarLocation(_id: $_id)
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(removeSecurityMehfilLangarLocationMutation, {
    name: 'removeSecurityMehfilLangarLocation',
    options: {
      refetchQueries: ['allSecurityMehfilLangarLocations'],
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfil Langar Locations', 'List'])
)(List);
