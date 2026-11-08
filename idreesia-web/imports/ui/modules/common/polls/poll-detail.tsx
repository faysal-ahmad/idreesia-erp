import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Empty,
  Flex,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  StopOutlined,
  StopTwoTone,
} from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { message } from '/imports/ui/antd-feedback';

import ActivityPanel from './activity-panel';
import BallotPanel from './ballot-panel';
import {
  describeClosing,
  formatDateTime,
  formatPollTime,
  PollStatusTag,
} from './format';
import type { PanelProps } from './panel-props';
import PollFormModal from './poll-form-modal';
import ResultsPanel from './results-panel';
import type { Poll, PollMember, PollsDataProvider, PollsInfo } from './types';
import VotersPanel from './voters-panel';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

type TabKey = 'vote' | 'results' | 'voters' | 'activity';
const TAB_PARAM = 'tab';

/** Asking for an end time: to open a draft whose end time has passed, or to reopen. */
type TimePrompt = { action: 'open' | 'reopen'; value: Dayjs } | null;

interface Props {
  provider: PollsDataProvider;
  pollId: string;
  /** Back to the list. */
  onBack: () => void;
}

/** One poll: its details, voting, results and (for managers) voters and activity. */
const PollDetail = ({ provider, pollId, onBack }: Props) => {
  const history = useHistory();
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get(TAB_PARAM);

  const [info, setInfo] = useState<PollsInfo | null>(null);
  const [members, setMembers] = useState<PollMember[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [timePrompt, setTimePrompt] = useState<TimePrompt>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedInfo, loadedPoll, loadedMembers] = await Promise.all([
        provider.getInfo(),
        provider.loadPoll(pollId),
        provider.loadMembers(),
      ]);
      setInfo(loadedInfo);
      setPoll(loadedPoll);
      setMembers(loadedMembers);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [provider, pollId]);

  useEffect(() => {
    load();
  }, [load]);

  // Reload when an open poll reaches its end time, so it shows as closed.
  useEffect(() => {
    if (poll?.status !== 'open') return undefined;
    const wait = Number(poll.closesAt) - Date.now();
    if (wait > 24 * 60 * 60 * 1000) return undefined;
    const timer = setTimeout(load, Math.max(0, wait) + 1500);
    return () => clearTimeout(timer);
  }, [poll?.status, poll?.closesAt, load]);

  const setTab = (key: string) => {
    const params = new URLSearchParams(location.search);
    params.set(TAB_PARAM, key);
    history.replace({
      pathname: location.pathname,
      search: `?${params.toString()}`,
      state: location.state,
    });
  };

  const run = async (action: () => Promise<Poll>, success: string) => {
    setBusy(true);
    try {
      setPoll(await action());
      message.success(success, 2);
      return true;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (loading && !poll) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Spin />
      </Flex>
    );
  }
  if (!poll || !info) {
    return (
      <Flex vertical align="center" gap={12} style={{ padding: 24 }}>
        <Empty description={loadError ?? 'Poll not found'} />
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Back to Polls
        </Button>
      </Flex>
    );
  }

  const { canManage } = info;
  const isDraft = poll.status === 'draft';
  const isOpen = poll.status === 'open';
  const isClosed = poll.status === 'closed';
  const panelProps: PanelProps = {
    provider,
    poll,
    info,
    members,
    onPollChange: setPoll,
  };

  const tabKeys: TabKey[] = [
    'vote',
    'results',
    ...(canManage ? (['voters', 'activity'] as TabKey[]) : []),
  ];
  const defaultTab: TabKey = isClosed && poll.canSeeResults ? 'results' : 'vote';
  const activeTab: TabKey = tabKeys.includes(tabParam as TabKey)
    ? (tabParam as TabKey)
    : defaultTab;

  const openPoll = () => {
    if (Number(poll.closesAt) <= Date.now()) {
      setTimePrompt({ action: 'open', value: dayjs().add(1, 'day').startOf('hour') });
      return;
    }
    run(() => provider.openPoll(poll._id), 'Poll opened for voting');
  };

  const actions = canManage ? (
    <Space size={8} wrap>
      {isDraft || isOpen ? (
        <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
          Edit
        </Button>
      ) : null}
      {isDraft ? (
        <Popconfirm
          title="Open this poll for voting?"
          description={`Voting ends ${formatPollTime(poll.closesAt)}. The questions can't change afterwards.`}
          okText="Open"
          disabled={Number(poll.closesAt) <= Date.now()}
          onConfirm={openPoll}
        >
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={busy}
            onClick={() => {
              if (Number(poll.closesAt) <= Date.now()) openPoll();
            }}
          >
            Open Voting
          </Button>
        </Popconfirm>
      ) : null}
      {isOpen ? (
        <Popconfirm
          title="Close voting now?"
          description="No more votes are accepted, and the results become final."
          okText="Close Voting"
          onConfirm={() => run(() => provider.closePoll(poll._id), 'Poll closed')}
        >
          <Button icon={<StopTwoTone />} loading={busy}>
            Close Now
          </Button>
        </Popconfirm>
      ) : null}
      {isClosed ? (
        <Button
          icon={<RollbackOutlined />}
          onClick={() =>
            setTimePrompt({
              action: 'reopen',
              value: dayjs().add(1, 'day').startOf('hour'),
            })
          }
        >
          Reopen
        </Button>
      ) : null}
      {isDraft || isOpen ? (
        <Button
          icon={<StopOutlined />}
          onClick={() => {
            setCancelReason('');
            setCancelling(true);
          }}
        >
          Cancel Poll
        </Button>
      ) : null}
      <Popconfirm
        title="Delete this poll?"
        description="Its questions and votes are removed permanently."
        okText="Delete"
        okButtonProps={{ danger: true }}
        onConfirm={async () => {
          try {
            await provider.deletePoll(poll._id);
            message.success('Poll deleted', 2);
            onBack();
          } catch (error) {
            showError(error);
          }
        }}
      >
        <Button danger icon={<DeleteOutlined />}>
          Delete
        </Button>
      </Popconfirm>
    </Space>
  ) : null;

  const closedBy = poll.closedByName
    ? `Closed early by ${poll.closedByName}`
    : 'Closed at its end time';

  return (
    <div className="poll-detail">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="poll-detail-back"
      >
        Polls
      </Button>
      <div className="poll-detail-header">
        <Space size={12} align="center" wrap>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {poll.title}
          </Typography.Title>
          <PollStatusTag status={poll.status} />
          {poll.anonymous ? (
            <Tag icon={<EyeInvisibleOutlined />}>Anonymous</Tag>
          ) : null}
        </Space>
        {actions}
      </div>

      {poll.status === 'cancelled' ? (
        <Alert
          type="warning"
          showIcon
          className="poll-detail-alert"
          message={`Cancelled${poll.cancelledByName ? ` by ${poll.cancelledByName}` : ''} on ${formatDateTime(poll.cancelledAt)}`}
          description={poll.cancellationReason ?? undefined}
        />
      ) : null}
      {canManage && isDraft ? (
        <Alert
          type="info"
          showIcon
          className="poll-detail-alert"
          message="This poll is a draft and only coordinators can see it. Open it to start voting."
        />
      ) : null}

      <Descriptions
        className="poll-detail-info"
        size="small"
        bordered
        column={{ xs: 1, md: 2 }}
        items={[
          {
            key: 'closing',
            label: isClosed ? 'Closed' : 'Voting ends',
            children: isClosed
              ? `${formatPollTime(poll.closedAt ?? poll.closesAt)} · ${closedBy}`
              : describeClosing(poll) || formatPollTime(poll.closesAt),
          },
          {
            key: 'votes',
            label: 'Votes',
            children: poll.eligibleCount
              ? `${poll.voteCount} of ${poll.eligibleCount} eligible`
              : poll.voteCount,
          },
          {
            key: 'results',
            label: 'Results',
            children: poll.showResultsWhileOpen
              ? 'Visible while voting is open'
              : 'Visible once voting ends',
          },
          {
            key: 'created',
            label: 'Created by',
            children: poll.createdByName ?? '—',
          },
          ...(poll.description
            ? [
                {
                  key: 'description',
                  label: 'Description',
                  span: 2,
                  children: (
                    <span className="poll-pre-wrap">{poll.description}</span>
                  ),
                },
              ]
            : []),
        ]}
      />

      <Tabs
        activeKey={activeTab}
        onChange={setTab}
        destroyOnHidden
        items={[
          {
            key: 'vote',
            label: poll.hasVoted || !isOpen ? 'Questions' : 'Vote',
            children: <BallotPanel {...panelProps} />,
          },
          {
            key: 'results',
            label: 'Results',
            children: <ResultsPanel {...panelProps} />,
          },
          ...(canManage
            ? [
                {
                  key: 'voters',
                  label: 'Voters',
                  children: <VotersPanel {...panelProps} />,
                },
                {
                  key: 'activity',
                  label: 'Activity',
                  children: <ActivityPanel {...panelProps} />,
                },
              ]
            : []),
        ]}
      />

      <PollFormModal
        open={editing}
        poll={poll}
        members={members}
        onCancel={() => setEditing(false)}
        onSubmit={async details => {
          if (await run(() => provider.updatePoll(poll._id, details), 'Poll saved')) {
            setEditing(false);
          }
        }}
      />
      <Modal
        open={!!timePrompt}
        title={timePrompt?.action === 'reopen' ? 'Reopen Voting' : 'Open Voting'}
        okText={timePrompt?.action === 'reopen' ? 'Reopen' : 'Open'}
        confirmLoading={busy}
        okButtonProps={{
          disabled: !timePrompt || !timePrompt.value.isAfter(dayjs()),
        }}
        onCancel={() => setTimePrompt(null)}
        onOk={async () => {
          if (!timePrompt) return;
          const closesAt = String(timePrompt.value.second(0).millisecond(0).valueOf());
          const done = await run(
            () =>
              timePrompt.action === 'reopen'
                ? provider.reopenPoll(poll._id, closesAt)
                : provider.openPoll(poll._id, closesAt),
            timePrompt.action === 'reopen' ? 'Poll reopened' : 'Poll opened for voting'
          );
          if (done) setTimePrompt(null);
        }}
        destroyOnHidden
      >
        <Typography.Paragraph>
          {timePrompt?.action === 'reopen'
            ? 'Members can vote again until the new end time. Existing votes are kept.'
            : 'The end time has passed. Pick when voting should end.'}
        </Typography.Paragraph>
        <DatePicker
          showTime={{ format: Formats.TIME_FORMAT, use12Hours: true, minuteStep: 5 }}
          format={Formats.DATE_TIME_FORMAT}
          allowClear={false}
          value={timePrompt?.value}
          disabledDate={date => date.isBefore(dayjs(), 'day')}
          onChange={value => value && setTimePrompt(prompt => (prompt ? { ...prompt, value } : prompt))}
        />
      </Modal>
      <Modal
        open={cancelling}
        title="Cancel Poll"
        okText="Cancel Poll"
        okButtonProps={{ danger: true }}
        cancelText="Keep It"
        confirmLoading={busy}
        onCancel={() => setCancelling(false)}
        onOk={async () => {
          if (
            await run(
              () => provider.cancelPoll(poll._id, cancelReason.trim() || undefined),
              'Poll cancelled'
            )
          ) {
            setCancelling(false);
          }
        }}
        destroyOnHidden
      >
        <Typography.Paragraph>
          Voting stops and the poll has no results. This can&apos;t be undone.
        </Typography.Paragraph>
        <Input.TextArea
          rows={3}
          maxLength={10000}
          placeholder="Reason (optional)"
          value={cancelReason}
          onChange={event => setCancelReason(event.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PollDetail;
