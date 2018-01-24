import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { Profiles } from '/imports/lib/collections/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    profiles: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.profilesPath}/${record._id}`}>{this.getFullName(record)}</Link>
      )
    }
  ];

  getFullName(profile) {
    return `${profile.firstName} ${profile.lastName}`;
  }

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.profilesNewFormPath);
  };

  render() {
    const { profiles } = this.props;
    return (
      <Table
        rowKey={'_id'}
        dataSource={profiles}
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
  const subscription = Meteor.subscribe('admin/profiles#all');
  if (subscription.ready()) {
    const profiles = Profiles.find({}).fetch();
    onData(null, { profiles });
  }
}

export default merge(
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Admin', 'Setup', 'Profiles', 'List'])
)(List);
