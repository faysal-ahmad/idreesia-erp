import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';
import { Button, Table, Tooltip, message } from 'antd';
import { DeleteOutlined, PlusCircleOutlined, TeamOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { ALL_MEHFILS, REMOVE_MEHFIL } from './gql';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allMehfils: PropTypes.array,
    removeMehfil: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.mehfilsEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      title: 'Mehfil Date',
      dataIndex: 'mehfilDate',
      key: 'mehfilDate',
      render: text => {
        const mehfilDate = moment(Number(text));
        return mehfilDate.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Karkun Count',
      dataIndex: 'karkunCount',
      key: 'karkunCount',
    },
    {
      key: 'action',
      width: 50,
      render: (text, record) => {
        const karkunsAction = (
          <Tooltip key="karkuns" title="Karkuns">
            <TeamOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleKarkunsClicked(record);
              }}
            />
          </Tooltip>
        );

        let deleteAction = null;
        if (record.karkunCount === 0) {
          deleteAction = (
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

        return (
          <div className="list-actions-column">
            {karkunsAction}
            {deleteAction}
          </div>
        );
      },
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.mehfilsNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeMehfil } = this.props;
    removeMehfil({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleKarkunsClicked = record => {
    const { history } = this.props;
    history.push(paths.mehfilsKarkunListPath(record._id));
  };

  render() {
    const { allMehfils } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allMehfils}
        columns={this.columns}
        pagination={{ defaultPageSize: 20 }}
        bordered
        title={() => (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={this.handleNewClicked}
          >
            New Mehfil
          </Button>
        )}
      />
    );
  }
}

export default flowRight(
  graphql(ALL_MEHFILS, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(REMOVE_MEHFIL, {
    name: 'removeMehfil',
    options: {
      refetchQueries: [{ query: ALL_MEHFILS }],
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfils', 'List'])
)(List);
