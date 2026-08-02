import React from 'react';
import { Link } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Button, Table, Tooltip, message } from 'antd';
import { DeleteOutlined, PlusCircleOutlined, TeamOutlined } from '@ant-design/icons';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllMehfilsQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { ALL_MEHFILS, REMOVE_MEHFIL } from './gql';

const RouterLink = Link as any;

type Mehfil = NonNullable<
  NonNullable<AllMehfilsQuery['allMehfils']>[number]
>;

const List = ({ history }: RouteComponentProps) => {
  useBreadcrumbs(['Security', 'Mehfils', 'List']);

  const { data } = useQuery(ALL_MEHFILS);
  const allMehfils = (data?.allMehfils ?? []).filter(
    (mehfil): mehfil is Mehfil => mehfil != null
  );
  const [removeMehfil] = useMutation(REMOVE_MEHFIL, {
    refetchQueries: [{ query: ALL_MEHFILS }],
  });

  const handleNewClicked = () => {
    history.push(paths.mehfilsNewFormPath);
  };

  const handleDeleteClicked = (record: Mehfil) => {
    removeMehfil({
      variables: {
        _id: record._id ?? '',
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleKarkunsClicked = (record: Mehfil) => {
    history.push(paths.mehfilsKarkunListPath(record._id ?? ''));
  };

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Mehfil) => (
        <RouterLink to={`${paths.mehfilsEditFormPath(record._id ?? '')}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Mehfil Date',
      dataIndex: 'mehfilDate',
      key: 'mehfilDate',
      render: (text: string | number | null) => {
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
      render: (_text: unknown, record: Mehfil) => {
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

export default List;
