import React from 'react';
import { Link } from 'react-router-dom';

const RouterLink = Link as any;
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllSecurityMehfilLangarDishesQuery } from 'meteor/idreesia-common/types/client-operations';
import { Button, Table, Tooltip, message } from 'antd';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import {
  ALL_SECURITY_MEHFIL_LANGAR_DISHES,
  REMOVE_SECURITY_MEHFIL_LANGAR_DISH,
} from './gql';

type LangarDishRow = NonNullable<
  NonNullable<AllSecurityMehfilLangarDishesQuery['allSecurityMehfilLangarDishes']>[number]
>;

interface ListProps {
  history: History;
}

const List = ({ history }: ListProps) => {
  useBreadcrumbs(['Security', 'Mehfil Langar Dishes', 'List']);
  const { data } = useQuery(ALL_SECURITY_MEHFIL_LANGAR_DISHES);
  const allSecurityMehfilLangarDishes = (data?.allSecurityMehfilLangarDishes ?? []).filter(
    (row): row is LangarDishRow => row != null && row._id != null
  );
  const [removeSecurityMehfilLangarDish] = useMutation(REMOVE_SECURITY_MEHFIL_LANGAR_DISH, {
    refetchQueries: ['allSecurityMehfilLangarDishes'],
  });

  const handleNewClicked = () => {
    history.push(paths.mehfilLangarDishesNewFormPath);
  };

  const handleDeleteClicked = (record: LangarDishRow) => {
    removeSecurityMehfilLangarDish({
      variables: {
        _id: record._id!,
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
      render: (text: string, record: LangarDishRow) => (
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
      render: (_text: unknown, record: LangarDishRow) => {
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
      dataSource={allSecurityMehfilLangarDishes}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Langar Dish
        </Button>
      )}
    />
  );
};

export default List;
