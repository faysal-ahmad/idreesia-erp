import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const listQuery = gql`
  query allDutyLocations {
    allDutyLocations {
      _id
      name
      usedCount
    }
  }
`;

const removeDutyLocationMutation = gql`
  mutation removeDutyLocation($_id: String!) {
    removeDutyLocation(_id: $_id)
  }
`;

const RouterLink = Link as any;
const AntButton = Button as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
interface HistoryLike { push(path: string): void; }
interface ListProps { history: HistoryLike; }
interface ListRecord { _id: string; name: string; description?: string; usedCount?: number; }
interface ListData { allDutyLocations?: ListRecord[]; }

const List = ({ history }: ListProps) => {
  const { data } = useQuery(listQuery as any);
  const [removeDutyLocation] = useMutation(removeDutyLocationMutation as any, {
    refetchQueries: ['allDutyLocations'],
  });
  const { allDutyLocations = [] } = (data ?? {}) as ListData;

  const handleNewClicked = () => {
    history.push(paths.dutyLocationsNewFormPath);
  };

  const handleDeleteClicked = (record: ListRecord) => {
    removeDutyLocation({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ListRecord) => (
        <RouterLink to={`${paths.dutyLocationsPath}/${record._id}`}>{text}</RouterLink>
      ),
    },
    {
      key: 'action',
      render: (_text: unknown, record: ListRecord) => {
        if (record.usedCount === 0) {
          return (
            <AntTooltip title="Delete">
              <AntDeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteClicked(record);
                }}
              />
            </AntTooltip>
          );
        }
        return null;
      },
    },
  ];

  return (
    <AntTable
      rowKey="_id"
      dataSource={allDutyLocations}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Duty Location
        </AntButton>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Duty Locations', 'List'])(List as any);
