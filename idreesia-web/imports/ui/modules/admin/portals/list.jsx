import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Table } from '/imports/ui/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allPortals: PropTypes.array,
  };

  columns = [
    {
      title: 'Portal Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.portalsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Cities',
      dataIndex: 'cities',
      key: 'cities',
      render: cities => (cities || []).map(city => city.name).join(', '),
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.portalsNewFormPath);
  };

  render() {
    const { allPortals } = this.props;
    return (
      <Table
        rowKey="_id"
        dataSource={allPortals}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Portal
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allPortals {
    allPortals {
      _id
      name
      cities {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Portals', 'List'])
)(List);
