import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Icon, Table, Tooltip, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allSharedResidences: PropTypes.array,
    removeSharedResidence: PropTypes.func,
  };

  columns = [
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text, record) => (
        <Link to={`${paths.sharedResidencesEditFormPath(record._id)}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      render: (text, record) => <KarkunName karkun={record.owner} />,
    },
    {
      title: 'Residents',
      dataIndex: 'residents',
      key: 'residents',
      render: (text, record) => {
        const residents = record.residents || [];
        const residentsNodes = residents.map(resident => (
          <KarkunName karkun={resident} />
        ));
        return <ul>{residentsNodes}</ul>;
      },
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.residentCount === 0) {
          return (
            <Tooltip key="delete" title="Delete">
              <Icon
                type="delete"
                style={IconStyle}
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
    history.push(paths.sharedResidencesNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeSharedResidence } = this.props;
    removeSharedResidence({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allSharedResidences } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allSharedResidences}
        columns={this.columns}
        pagination={{ defaultPageSize: 20 }}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Shared Residence
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allSharedResidences {
    allSharedResidences {
      _id
      address
      residentCount
      owner {
        _id
        name
        imageId
      }
      residents {
        _id
        name
        imageId
      }
    }
  }
`;

const removeSharedResidenceMutation = gql`
  mutation removeSharedResidence($_id: String!) {
    removeSharedResidence(_id: $_id)
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(removeSharedResidenceMutation, {
    name: 'removeSharedResidence',
    options: {
      refetchQueries: ['allSharedResidences'],
    },
  }),
  WithBreadcrumbs(['Security', 'Shared Residences', 'List'])
)(List);
