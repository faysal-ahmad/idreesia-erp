import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Icon, Table, Tooltip, message } from '/imports/ui/controls';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import { ALL_IMDAD_REASONS, REMOVE_IMDAD_REASON } from './gql';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    allImdadReasons: PropTypes.array,
    allImdadReasonsLoading: PropTypes.bool,
    removeImdadReason: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Link to={`${paths.imdadReasonsEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Used Count',
      dataIndex: 'usedCount',
      key: 'usedCount',
      width: 150,
    },
    {
      key: 'action',
      width: 70,
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
    history.push(paths.imdadReasonsNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeImdadReason } = this.props;
    removeImdadReason({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allImdadReasons, allImdadReasonsLoading } = this.props;
    if (allImdadReasonsLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={allImdadReasons}
        columns={this.columns}
        bordered
        pagination={{ defaultPageSize: 20 }}
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            size="large"
            onClick={this.handleNewClicked}
          >
            New Imdad Reason
          </Button>
        )}
      />
    );
  }
}

export default flowRight(
  graphql(ALL_IMDAD_REASONS, {
    props: ({ data }) => ({ allImdadReasonsLoading: data.loading, ...data }),
  }),
  graphql(REMOVE_IMDAD_REASON, {
    name: 'removeIdadReason',
    options: {
      refetchQueries: [{ query: ALL_IMDAD_REASONS }],
    },
  }),
  WithBreadcrumbs(['Accounts', 'Imdad Reasons', 'List'])
)(List);
