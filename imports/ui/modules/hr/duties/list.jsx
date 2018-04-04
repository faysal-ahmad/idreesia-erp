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
    allDuties: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.dutiesPath}/${record._id}`}>{text}</Link>
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.dutiesNewFormPath);
  };

  render() {
    const { allDuties } = this.props;

    return (
      <Table
        rowKey={'_id'}
        dataSource={allDuties}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Duty
            </Button>
          );
        }}
      />
    );
  }
}

const listQuery = gql`
  query allDuties {
    allDuties {
      _id
      name
    }
  }
`;

export default merge(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data })
  }),
  WithBreadcrumbs(['HR', 'Setup', 'Duties', 'List'])
)(List);
