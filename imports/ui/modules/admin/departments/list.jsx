import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { Departments } from '/imports/lib/collections/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    departments: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.departmentsPath}/${record._id}`}>{text}</Link>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.departmentsNewFormPath);
  };

  render() {
    const { departments } = this.props;
    return (
      <Table
        rowKey={'_id'}
        dataSource={departments}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Profile
            </Button>
          );
        }}
      />
    );
  }
}

function dataLoader(props, onData) {
  const subscription = Meteor.subscribe('admin/departments#all');
  if (subscription.ready()) {
    const departments = Departments.find({}).fetch();
    onData(null, { departments });
  }
}

export default merge(
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Admin', 'Setup', 'Departments', 'List'])
)(List);
