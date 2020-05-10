import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Icon, Table, Tooltip, message } from '/imports/ui/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allMSDuties: PropTypes.array,
    removeDuty: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Link to={`${paths.msDutiesEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'Shifts',
      dataIndex: 'shifts',
      key: 'shifts',
      render: (text, record) => {
        if (!record.shifts || record.shifts.length === 0) return null;
        const shiftNames = record.shifts.map(shift => shift.name);
        return shiftNames.join(', ');
      },
    },
    {
      title: 'Karkuns',
      dataIndex: 'usedCount',
      key: 'usedCount',
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.canDelete) {
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
    history.push(paths.msDutiesNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeDuty } = this.props;
    removeDuty({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allMSDuties } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allMSDuties}
        columns={this.columns}
        pagination={{ defaultPageSize: 20 }}
        bordered
        size="small"
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Duty
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allMSDuties {
    allMSDuties {
      _id
      name
      description
      canDelete
      shifts {
        _id
        name
      }
    }
  }
`;

const removeDutyMutation = gql`
  mutation removeDuty($_id: String!) {
    removeDuty(_id: $_id)
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(removeDutyMutation, {
    name: 'removeDuty',
    options: {
      refetchQueries: ['allMSDuties'],
    },
  }),
  WithBreadcrumbs(['HR', 'Duties & Shifts', 'List'])
)(List);
