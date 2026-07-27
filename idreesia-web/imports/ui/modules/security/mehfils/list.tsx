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

const AntButton = Button as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntTeamOutlined = TeamOutlined as any;
const RouterLink = Link as any;

interface HistoryLike {
  push(path: string): void;
}

interface ListProps {
  history: HistoryLike;
}

interface Mehfil {
  _id: string;
  name: string;
  mehfilDate: string | number;
  karkunCount?: number;
}

interface MehfilsData {
  allMehfils?: Mehfil[];
}

const List = ({ history }: ListProps) => {
  const { data = {} } = useQuery(ALL_MEHFILS as any);
  const { allMehfils = [] } = data as MehfilsData;
  const [removeMehfil] = useMutation(REMOVE_MEHFIL as any, {
    refetchQueries: [{ query: ALL_MEHFILS as any }],
  });

  const handleNewClicked = () => {
    history.push(paths.mehfilsNewFormPath);
  };

  const handleDeleteClicked = (record: Mehfil) => {
    removeMehfil({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleKarkunsClicked = (record: Mehfil) => {
    history.push(paths.mehfilsKarkunListPath(record._id));
  };

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Mehfil) => (
        <RouterLink to={`${paths.mehfilsEditFormPath(record._id)}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Mehfil Date',
      dataIndex: 'mehfilDate',
      key: 'mehfilDate',
      render: (text: string | number) => {
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
          <AntTooltip key="karkuns" title="Karkuns">
            <AntTeamOutlined
              className="list-actions-icon"
              onClick={() => {
                handleKarkunsClicked(record);
              }}
            />
          </AntTooltip>
        );

        let deleteAction = null;
        if (record.karkunCount === 0) {
          deleteAction = (
            <AntTooltip key="delete" title="Delete">
              <AntDeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteClicked(record);
                }}
              />
            </AntTooltip>
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
    <AntTable
      rowKey="_id"
      dataSource={allMehfils}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Mehfil
        </AntButton>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfils', 'List'])(List as any);
