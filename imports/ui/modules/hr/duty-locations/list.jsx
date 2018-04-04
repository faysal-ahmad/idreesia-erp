import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allDutyLocations: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.dutyLocationsPath}/${record._id}`}>{text}</Link>
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.dutyLocationsNewFormPath);
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
    }
  }
`;

export default merge(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data })
  }),
  WithBreadcrumbs(['HR', 'Setup', 'Duty Locations', 'List'])
)(List);
