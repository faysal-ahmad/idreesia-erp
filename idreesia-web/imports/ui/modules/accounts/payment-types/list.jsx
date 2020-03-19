import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Icon, Table, Tooltip, message } from '/imports/ui/controls';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';

import { ALL_PAYMENT_TYPES, REMOVE_PAYMENT_TYPE } from './gql';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    allPaymentTypes: PropTypes.array,
    allPaymentTypesLoading: PropTypes.bool,
    removePaymentType: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Link to={`${paths.paymentTypesEditFormPath(record._id)}`}>{text}</Link>
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
    history.push(paths.paymentTypesNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removePaymentType } = this.props;
    removePaymentType({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allPaymentTypes, allPaymentTypesLoading } = this.props;
    if (allPaymentTypesLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={allPaymentTypes}
        columns={this.columns}
        bordered
        pagination={{ defaultPageSize: 20 }}
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Payment Type
          </Button>
        )}
      />
    );
  }
}

export default flowRight(
  graphql(ALL_PAYMENT_TYPES, {
    props: ({ data }) => ({ allPaymentTypesLoading: data.loading, ...data }),
  }),
  graphql(REMOVE_PAYMENT_TYPE, {
    name: 'removePaymentType',
    options: {
      refetchQueries: [{ query: ALL_PAYMENT_TYPES }],
    },
  }),
  WithBreadcrumbs(['Accounts', 'Payment Types', 'List'])
)(List);
