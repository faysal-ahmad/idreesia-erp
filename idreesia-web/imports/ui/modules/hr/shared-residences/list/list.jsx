import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { Button, Icon, Pagination, Table, Tooltip, message } from '/imports/ui/controls';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import ListFilter from './list-filter';

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
};

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    address: PropTypes.string,
    karkunName: PropTypes.string,
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    setPageParams: PropTypes.func,
    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedSharedResidences: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    removeSharedResidence: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.sharedResidencesEditFormPath(record._id)}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
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
          <KarkunName key={resident._id} karkun={resident} />
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

  getTableHeader = () => {
    const { address, karkunName, refetchListQuery, setPageParams } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          onClick={this.handleNewClicked}
        >
          New Shared Residence
        </Button>
        <ListFilter
          name={name}
          address={address}
          karkunName={karkunName}
          setPageParams={setPageParams}
          refreshData={refetchListQuery}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedSharedResidences: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        bordered
        size="small"
        pagination={false}
        title={this.getTableHeader}
        footer={() => (
          <Pagination
            defaultCurrent={1}
            defaultPageSize={20}
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}

const listQuery = gql`
  query pagedSharedResidences($queryString: String) {
    pagedSharedResidences(queryString: $queryString) {
      totalResults
      data {
        _id
        name
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
  }
`;

const removeSharedResidenceMutation = gql`
  mutation removeSharedResidence($_id: String!) {
    removeSharedResidence(_id: $_id)
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({ queryString }) => ({
      variables: {
        queryString,
      },
    }),
  }),
  graphql(removeSharedResidenceMutation, {
    name: 'removeSharedResidence',
    options: {
      refetchQueries: ['pagedSharedResidences'],
    },
  })
)(List);
