import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Table, Tooltip, message } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const listQuery = gql`
  query allMSDuties {
    allMSDuties {
      _id
      name
      description
      canDelete
      shifts {
        _id
        name
      }
    }
  }
`;

const removeDutyMutation = gql`
  mutation removeDuty($_id: String!) {
    removeDuty(_id: $_id)
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
interface DutyShiftSummary { _id: string; name: string; }
interface DutyRecord { _id: string; name: string; description?: string; canDelete?: boolean; shifts?: DutyShiftSummary[]; usedCount?: number; }
interface ListData { allMSDuties?: DutyRecord[]; }

const List = ({ history }: ListProps) => {
  const { data } = useQuery(listQuery as any);
  const [removeDuty] = useMutation(removeDutyMutation as any, {
    refetchQueries: ['allMSDuties'],
  });
  const { allMSDuties = [] } = (data ?? {}) as ListData;

  const handleNewClicked = () => {
    history.push(paths.msDutiesNewFormPath);
  };

  const handleDeleteClicked = (record: DutyRecord) => {
    removeDuty({
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
      width: 200,
      render: (text: string, record: DutyRecord) => (
        <RouterLink to={`${paths.msDutiesEditFormPath(record._id)}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'Shifts',
      dataIndex: 'shifts',
      key: 'shifts',
      render: (_text: unknown, record: DutyRecord) => {
        if (!record.shifts || record.shifts.length === 0) return null;
        const shiftNames = record.shifts.map(shift => shift.name);
        return shiftNames.join(', ');
      },
    },
    {
      title: 'Karkuns',
      dataIndex: 'usedCount',
      key: 'usedCount',
    },
    {
      key: 'action',
      render: (_text: unknown, record: DutyRecord) => {
        if (record.canDelete) {
          return (
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

        return null;
      },
    },
  ];

  return (
    <AntTable
      rowKey="_id"
      dataSource={allMSDuties}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      size="small"
      title={() => (
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Duty
        </AntButton>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Duties & Shifts', 'List'])(List as any);
