import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Icon, Table, Tooltip, message } from '/imports/ui/controls';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allCities: PropTypes.array,
    removeCity: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.citiesEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Mehfils',
      dataIndex: 'mehfils',
      key: 'mehfils',
      render: (text, record) => {
        if (!record.mehfils || record.mehfils.length === 0) return null;
        const mehfilNames = record.mehfils.map(mehfil => mehfil.name);
        return mehfilNames.join(', ');
      },
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.usedCount === 0) {
          return (
            <Tooltip key="delete" title="Delete">
              <Icon
                type="delete"
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
    history.push(paths.citiesNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeCity } = this.props;
    removeCity({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allCities } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allCities}
        columns={this.columns}
        pagination={{ defaultPageSize: 20 }}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New City
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allCities {
    allCities {
      _id
      name
      country
      mehfils {
        _id
        name
      }
    }
  }
`;

const removeCityMutation = gql`
  mutation removeCity($_id: String!) {
    removeCity(_id: $_id)
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(removeCityMutation, {
    name: 'removeCity',
    options: {
      refetchQueries: ['allCities'],
    },
  }),
  WithBreadcrumbs(['Outstation', 'Cities & Mehfils', 'List'])
)(List);
