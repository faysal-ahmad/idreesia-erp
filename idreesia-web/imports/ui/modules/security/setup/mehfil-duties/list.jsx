import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

const listQuery = gql`
  query allSecurityMehfilDuties {
    allSecurityMehfilDuties {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

const removeSecurityMehfilDutyMutation = gql`
  mutation removeSecurityMehfilDuty($_id: String!) {
    removeSecurityMehfilDuty(_id: $_id)
  }
`;

const List = ({ history }) => {
  const { data = {} } = useQuery(listQuery);
  const { allSecurityMehfilDuties } = data;
  const [removeSecurityMehfilDuty] = useMutation(
    removeSecurityMehfilDutyMutation,
    {
      refetchQueries: ['allSecurityMehfilDuties'],
    }
  );

  const handleNewClicked = () => {
    history.push(paths.mehfilDutiesNewFormPath);
  };

  const handleDeleteClicked = record => {
    removeSecurityMehfilDuty({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.mehfilDutiesPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Urdu Name',
      dataIndex: 'urduName',
      key: 'urduName',
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.overallUsedCount === 0) {
          return (
            <Tooltip title="Delete">
              <DeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteClicked(record);
                }}
              />
            </Tooltip>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={allSecurityMehfilDuties}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Mehfil Duty
        </Button>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Duties', 'List'])(List);
