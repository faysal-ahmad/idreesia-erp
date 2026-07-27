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
  query allSecurityMehfilLangarDishes {
    allSecurityMehfilLangarDishes {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

const removeSecurityMehfilLangarDishMutation = gql`
  mutation removeSecurityMehfilLangarDish($_id: String!) {
    removeSecurityMehfilLangarDish(_id: $_id)
  }
`;

const AntButton = Button as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const RouterLink = Link as any;
interface HistoryLike { push(path: string): void; }
interface ListProps { history: HistoryLike; }
interface LangarDish { _id: string; name: string; urduName?: string; overallUsedCount?: number; }
interface ListData { allSecurityMehfilLangarDishes?: LangarDish[]; }

const List = ({ history }: ListProps) => {
  const { data = {} } = useQuery(listQuery as any);
  const { allSecurityMehfilLangarDishes = [] } = data as ListData;
  const [removeSecurityMehfilLangarDish] = useMutation(
    removeSecurityMehfilLangarDishMutation as any,
    {
      refetchQueries: ['allSecurityMehfilLangarDishes'],
    }
  );

  const handleNewClicked = () => {
    history.push(paths.mehfilLangarDishesNewFormPath);
  };

  const handleDeleteClicked = (record: LangarDish) => {
    removeSecurityMehfilLangarDish({
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
      render: (text: string, record: LangarDish) => (
        <RouterLink to={`${paths.mehfilLangarDishesPath}/${record._id}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Urdu Name',
      dataIndex: 'urduName',
      key: 'urduName',
    },
    {
      key: 'action',
      render: (_text: unknown, record: LangarDish) => {
        if (record.overallUsedCount === 0) {
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
      dataSource={allSecurityMehfilLangarDishes}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Langar Dish
        </AntButton>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Langar Dishes', 'List'])(List as any);
