import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Button, Table, Tooltip, message } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import { ALL_MEHFIL_DUTIES, REMOVE_OUTSTATION_MEHFIL_DUTY } from './gql';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allMehfilDuties: PropTypes.array,
    removeDuty: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Link to={`${paths.mehfilDutiesEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Karkuns',
      dataIndex: 'usedCount',
      key: 'usedCount',
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.usedCount === 0) {
          return (
            <Tooltip key="delete" title="Delete">
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
    history.push(paths.mehfilDutiesNewFormPath);
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
    const { allMehfilDuties } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allMehfilDuties}
        columns={this.columns}
        pagination={{ defaultPageSize: 20 }}
        bordered
        size="small"
        title={() => (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={this.handleNewClicked}
          >
            New Duty
          </Button>
        )}
      />
    );
  }
}

export default flowRight(
  graphql(ALL_MEHFIL_DUTIES, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(REMOVE_OUTSTATION_MEHFIL_DUTY, {
    name: 'removeDuty',
    options: {
      refetchQueries: ['allMehfilDuties'],
    },
  }),
  WithBreadcrumbs(['Outstation', 'Mehfil Duties', 'List'])
)(List);
