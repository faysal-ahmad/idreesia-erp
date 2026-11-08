import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Button,
  Empty,
  Flex,
  Input,
  Pagination,
  Segmented,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckCircleFilled,
  EyeInvisibleOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import { describeClosing, PollStatusTag } from './format';
import PollFormModal from './poll-form-modal';
import type {
  Poll,
  PollMember,
  PollsDataProvider,
  PollsInfo,
  PollsView,
} from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

// The view is kept in the URL, so coming back from a poll returns to the
// same list.
const VIEW_PARAM = 'view';

const VIEW_OPTIONS: Array<{ value: PollsView; label: string; manage?: boolean }> =
  [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'drafts', label: 'Drafts', manage: true },
    { value: 'all', label: 'All' },
  ];

const EMPTY_TEXT: Record<PollsView, string> = {
  open: 'No open polls',
  closed: 'No closed polls',
  drafts: 'No draft polls',
  all: 'No polls yet',
};

interface Props {
  provider: PollsDataProvider;
  onOpenPoll: (pollId: string) => void;
}

/**
 * A list of polls - open, closed, drafts or all - and creating new ones.
 * All data comes from `provider`.
 */
const PollsBoard = ({ provider, onOpenPoll }: Props) => {
  const history = useHistory();
  const location = useLocation();

  const [info, setInfo] = useState<PollsInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [members, setMembers] = useState<PollMember[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [creating, setCreating] = useState(false);

  const viewOptions = VIEW_OPTIONS.filter(o => !o.manage || info?.canManage);
  const viewParam = new URLSearchParams(location.search).get(VIEW_PARAM);
  const view = (viewOptions.find(o => o.value === viewParam)?.value ??
    'open') as PollsView;

  const setView = (value: PollsView) => {
    const next = new URLSearchParams(location.search);
    if (value === 'open') next.delete(VIEW_PARAM);
    else next.set(VIEW_PARAM, value);
    const search = next.toString();
    history.replace({
      pathname: location.pathname,
      search: search ? `?${search}` : '',
    });
    setPage(1);
  };

  useEffect(() => {
    provider
      .getInfo()
      .then(setInfo)
      .catch(error => setInfoError(error.message));
    provider.loadMembers().then(setMembers).catch(showError);
  }, [provider]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await provider.loadPolls({
        view,
        text: searchText || undefined,
        pageIndex: page - 1,
        pageSize,
      });
      setPolls(result.polls);
      setTotalResults(result.totalResults);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, view, searchText, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const clearSearch = () => {
    setSearchInput('');
    setSearchText('');
    setPage(1);
  };

  if (!info) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        {infoError ? <Empty description={infoError} /> : <Spin />}
      </Flex>
    );
  }

  const columns = [
    {
      title: 'Poll',
      key: 'title',
      ellipsis: true,
      render: (_: unknown, poll: Poll) => (
        <Space size={8}>
          <Typography.Link onClick={() => onOpenPoll(poll._id)}>
            {poll.title}
          </Typography.Link>
          {poll.anonymous ? (
            <Tooltip title="Anonymous: results don't name voters">
              <EyeInvisibleOutlined style={{ color: '#667085' }} />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render: (_: unknown, poll: Poll) => <PollStatusTag status={poll.status} />,
    },
    {
      title: 'Closing',
      key: 'closing',
      width: 330,
      render: (_: unknown, poll: Poll) => describeClosing(poll),
    },
    {
      title: 'Votes',
      key: 'votes',
      width: 100,
      render: (_: unknown, poll: Poll) =>
        poll.eligibleCount
          ? `${poll.voteCount} / ${poll.eligibleCount}`
          : poll.voteCount,
    },
    {
      title: 'My Vote',
      key: 'myVote',
      width: 120,
      render: (_: unknown, poll: Poll) => {
        if (poll.hasVoted) {
          return (
            <Typography.Text type="success">
              <CheckCircleFilled /> Voted
            </Typography.Text>
          );
        }
        if (!poll.isEligible) {
          return <Typography.Text type="secondary">Not eligible</Typography.Text>;
        }
        return poll.status === 'open' ? (
          <Tag color="orange">Not yet</Tag>
        ) : (
          <Typography.Text type="secondary">Didn&apos;t vote</Typography.Text>
        );
      },
    },
  ];

  const header = (
    <div className="list-table-header">
      <Space size={12}>
        {info.canManage ? (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => setCreating(true)}
          >
            New Poll
          </Button>
        ) : null}
        <Segmented<PollsView>
          value={view}
          onChange={setView}
          options={viewOptions.map(({ value, label }) => ({ value, label }))}
        />
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Input.Search
            placeholder="Search polls"
            allowClear
            value={searchInput}
            onChange={event => {
              setSearchInput(event.target.value);
              if (!event.target.value) clearSearch();
            }}
            onSearch={value => {
              setSearchText(value.trim());
              setPage(1);
            }}
            style={{ width: 240 }}
          />
          <Button
            icon={<SyncOutlined />}
            onClick={() =>
              load().then(() => {
                message.success('Data Reloaded', 2);
              })
            }
            title="Reload Data"
          />
        </Space>
        {searchText ? (
          <Flex
            wrap="wrap"
            gap={8}
            align="center"
            justify="flex-end"
            className="list-filter-chips"
          >
            <Tag
              closable
              onClose={event => {
                event.preventDefault();
                clearSearch();
              }}
            >
              <span>Search: {searchText}</span>
            </Tag>
            <Button type="link" size="small" onClick={clearSearch}>
              Clear all
            </Button>
          </Flex>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="polls-board">
      {header}
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="_id"
          loading={loading}
          dataSource={polls}
          columns={columns}
          pagination={false}
          onRow={poll => ({
            onDoubleClick: () => onOpenPoll(poll._id),
          })}
          locale={{
            emptyText: searchText
              ? 'No polls match the search'
              : EMPTY_TEXT[view],
          }}
          footer={() => (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={totalResults}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} polls`
              }
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          )}
        />
      </div>
      <PollFormModal
        open={creating}
        members={members}
        onCancel={() => setCreating(false)}
        onSubmit={async details => {
          try {
            const poll = await provider.createPoll(details);
            message.success('Poll saved as a draft', 2);
            setCreating(false);
            onOpenPoll(poll._id);
          } catch (error) {
            showError(error);
          }
        }}
      />
    </div>
  );
};

export default PollsBoard;
