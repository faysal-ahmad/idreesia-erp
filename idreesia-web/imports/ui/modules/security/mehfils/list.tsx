// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Button, Table, Tooltip, message } from 'antd';
import { DeleteOutlined, PlusCircleOutlined, TeamOutlined } from '@ant-design/icons';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { ALL_MEHFILS, REMOVE_MEHFIL } from './gql';

const List = ({ history }) => {
  const { data = {} } = useQuery(ALL_MEHFILS);
  const { allMehfils } = data;
  const [removeMehfil] = useMutation(REMOVE_MEHFIL, {
    refetchQueries: [{ query: ALL_MEHFILS }],
  });

  const handleNewClicked = () => {
    history.push(paths.mehfilsNewFormPath);
  };

  const handleDeleteClicked = record => {
    removeMehfil({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleKarkunsClicked = record => {
    history.push(paths.mehfilsKarkunListPath(record._id));
  };

  const columns = [
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
        const mehfilDate = dayjs(Number(text));
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
                handleKarkunsClicked(record);
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
                  handleDeleteClicked(record);
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

  return (
    <Table
      rowKey="_id"
      dataSource={allMehfils}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Mehfil
        </Button>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfils', 'List'])(List);
