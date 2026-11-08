import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Select, Space, Table, Tag, Typography } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import type { PanelProps } from './panel-props';
import type { PollVoter } from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

/**
 * Managers: who can vote, and - for named polls - who has voted. Members
 * can be added while the poll is a draft or open.
 */
const VotersPanel = ({ provider, poll, members, onPollChange }: PanelProps) => {
  const [voters, setVoters] = useState<PollVoter[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setVoters(await provider.loadVoters(poll._id));
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, poll._id]);

  useEffect(() => {
    load();
  }, [load, poll.updatedAt, poll.voteCount]);

  const eligible = new Set(voters.map(({ voterId }) => voterId));
  const addable = members.filter(member => !eligible.has(member.voterId));
  const canAdd =
    (poll.status === 'open' || poll.status === 'draft') &&
    !!poll.eligibleVoterIds &&
    addable.length > 0;

  const addVoters = async () => {
    setBusy(true);
    try {
      onPollChange(await provider.addVoters(poll._id, adding));
      setAdding([]);
      message.success('Voters added', 2);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="poll-voters">
      {poll.anonymous ? (
        <Alert
          type="info"
          showIcon
          className="poll-voters-notice"
          message={`This poll is anonymous, so who has voted isn't shown. ${poll.voteCount} of ${voters.length} have voted.`}
        />
      ) : null}
      {canAdd ? (
        <Space size={8} className="poll-voters-add">
          <Select
            mode="multiple"
            allowClear
            optionFilterProp="label"
            placeholder="Add members who can vote"
            maxTagCount="responsive"
            style={{ width: 360 }}
            value={adding}
            onChange={setAdding}
            options={addable.map(member => ({
              value: member.voterId,
              label: member.name ?? member.voterId,
            }))}
          />
          <Button
            icon={<UserAddOutlined />}
            disabled={!adding.length}
            loading={busy}
            onClick={addVoters}
          >
            Add
          </Button>
        </Space>
      ) : null}
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="voterId"
          loading={loading}
          dataSource={voters}
          pagination={false}
          locale={{ emptyText: 'No eligible voters' }}
          columns={[
            {
              title: 'Name',
              key: 'name',
              ellipsis: true,
              render: (_: unknown, voter: PollVoter) => voter.name ?? voter.voterId,
            },
            ...(poll.anonymous
              ? []
              : [
                  {
                    title: 'Vote',
                    key: 'vote',
                    width: 140,
                    render: (_: unknown, voter: PollVoter) =>
                      voter.hasVoted ? (
                        <Tag color="green">Voted</Tag>
                      ) : (
                        <Typography.Text type="secondary">Not voted</Typography.Text>
                      ),
                  },
                ]),
          ]}
        />
      </div>
    </div>
  );
};

export default VotersPanel;
