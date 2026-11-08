import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Button,
  Calendar,
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
  CalendarOutlined,
  CheckSquareOutlined,
  PaperClipOutlined,
  PlusCircleOutlined,
  SyncOutlined,
  TableOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { message } from '/imports/ui/antd-feedback';

import { formatMeetingTime, MeetingStatusTag, RsvpTag } from './format';
import MeetingFormModal from './meeting-form-modal';
import type {
  Meeting,
  MeetingMember,
  MeetingsDataProvider,
  MeetingsInfo,
  MeetingsView,
} from './types';

type Mode = 'table' | 'calendar';
type ListView = Exclude<MeetingsView, 'all'>;

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

// The mode and list view are kept in the URL, so coming back from a
// meeting returns to the same place.
const MODE_PARAM = 'mode';
const VIEW_PARAM = 'view';
const MONTH_PARAM = 'month';

const VIEW_OPTIONS: Array<{ value: ListView; label: string }> = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

const EMPTY_TEXT: Record<ListView, string> = {
  upcoming: 'No upcoming meetings',
  past: 'No past meetings',
  cancelled: 'No cancelled meetings',
};

const CALENDAR_LIMIT = 200;

interface Props {
  provider: MeetingsDataProvider;
  onOpenMeeting: (meetingId: string) => void;
}

/**
 * A list of meetings - upcoming, past or cancelled, or a month calendar -
 * and scheduling new ones. All data comes from `provider`.
 */
const MeetingsBoard = ({ provider, onOpenMeeting }: Props) => {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode: Mode = params.get(MODE_PARAM) === 'calendar' ? 'calendar' : 'table';
  const view = (VIEW_OPTIONS.find(o => o.value === params.get(VIEW_PARAM))
    ?.value ?? 'upcoming') as ListView;
  const monthParam = params.get(MONTH_PARAM);
  const month = useMemo(
    () =>
      monthParam && /^\d{4}-\d{2}$/.test(monthParam)
        ? dayjs(`${monthParam}-01`)
        : dayjs().startOf('month'),
    [monthParam]
  );

  const [info, setInfo] = useState<MeetingsInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [members, setMembers] = useState<MeetingMember[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [creating, setCreating] = useState(false);

  const setParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(location.search);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    const search = next.toString();
    history.replace({
      pathname: location.pathname,
      search: search ? `?${search}` : '',
    });
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
      const result =
        mode === 'calendar'
          ? await provider.loadMeetings({
              view: 'all',
              // The visible grid spans parts of the months either side.
              from: String(month.subtract(7, 'day').valueOf()),
              to: String(month.endOf('month').add(14, 'day').valueOf()),
              pageIndex: 0,
              pageSize: CALENDAR_LIMIT,
            })
          : await provider.loadMeetings({
              view,
              text: searchText || undefined,
              pageIndex: page - 1,
              pageSize,
            });
      setMeetings(result.meetings);
      setTotalResults(result.totalResults);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, mode, view, month, searchText, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const byDay = useMemo(() => {
    const days = new Map<string, Meeting[]>();
    meetings.forEach(meeting => {
      const key = dayjs(Number(meeting.startsAt)).format('YYYY-MM-DD');
      days.set(key, [...(days.get(key) ?? []), meeting]);
    });
    return days;
  }, [meetings]);

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
      title: 'When',
      key: 'when',
      width: 270,
      render: (_: unknown, meeting: Meeting) =>
        formatMeetingTime(meeting.startsAt, meeting.endsAt),
    },
    {
      title: 'Meeting',
      key: 'title',
      ellipsis: true,
      render: (_: unknown, meeting: Meeting) => (
        <div>
          <Typography.Link onClick={() => onOpenMeeting(meeting._id)}>
            {meeting.title}
          </Typography.Link>
          {meeting.location ? (
            <div>
              <Typography.Text type="secondary">
                {meeting.location}
              </Typography.Text>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 170,
      render: (_: unknown, meeting: Meeting) => (
        <MeetingStatusTag
          status={meeting.status}
          startsAt={meeting.startsAt}
          endsAt={meeting.endsAt}
        />
      ),
    },
    {
      title: 'My Response',
      key: 'rsvp',
      width: 140,
      render: (_: unknown, meeting: Meeting) =>
        meeting.myRsvpStatus ? (
          <RsvpTag status={meeting.myRsvpStatus} />
        ) : (
          <Typography.Text type="secondary">Not invited</Typography.Text>
        ),
    },
    {
      title: 'Details',
      key: 'counts',
      width: 170,
      render: (_: unknown, meeting: Meeting) => (
        <Space size={12}>
          <Tooltip title="Participants">
            <span>
              <TeamOutlined /> {meeting.participants.length}
            </span>
          </Tooltip>
          <Tooltip title="Attachments">
            <span>
              <PaperClipOutlined /> {meeting.attachmentCount}
            </span>
          </Tooltip>
          <Tooltip title="Open action items">
            <span>
              <CheckSquareOutlined /> {meeting.openActionItemCount}
            </span>
          </Tooltip>
        </Space>
      ),
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
            New Meeting
          </Button>
        ) : null}
        <Segmented<Mode>
          value={mode}
          onChange={value => setParams({ [MODE_PARAM]: value === 'calendar' ? value : null })}
          options={[
            { value: 'table', icon: <TableOutlined />, label: 'List' },
            { value: 'calendar', icon: <CalendarOutlined />, label: 'Calendar' },
          ]}
        />
        {mode === 'table' ? (
          <Segmented<ListView>
            value={view}
            onChange={value => {
              setParams({ [VIEW_PARAM]: value === 'upcoming' ? null : value });
              setPage(1);
            }}
            options={VIEW_OPTIONS}
          />
        ) : null}
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          {mode === 'table' ? (
            <Input.Search
              placeholder="Search meetings"
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
          ) : null}
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
        {mode === 'table' && searchText ? (
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

  const table = (
    <div className="list-container">
      <Table
        className="list-table"
        size="middle"
        bordered
        tableLayout="fixed"
        rowKey="_id"
        loading={loading}
        dataSource={meetings}
        columns={columns}
        pagination={false}
        onRow={meeting => ({
          onDoubleClick: () => onOpenMeeting(meeting._id),
        })}
        locale={{
          emptyText: searchText ? 'No meetings match the search' : EMPTY_TEXT[view],
        }}
        footer={() => (
          <Pagination
            current={page}
            pageSize={pageSize}
            total={totalResults}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} meetings`
            }
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
        )}
      />
    </div>
  );

  const calendar = (
    <Spin spinning={loading}>
      <Calendar
        className="meetings-calendar"
        value={selectedDate ?? month}
        onPanelChange={value =>
          setParams({ [MONTH_PARAM]: value.format('YYYY-MM') })
        }
        onSelect={(value, { source }) => {
          setSelectedDate(value);
          if (source === 'date' && !value.isSame(month, 'month')) {
            setParams({ [MONTH_PARAM]: value.format('YYYY-MM') });
          }
        }}
        cellRender={(date, cellInfo) => {
          if (cellInfo.type !== 'date') return cellInfo.originNode;
          const dayMeetings = byDay.get(date.format('YYYY-MM-DD')) ?? [];
          return (
            <ul className="meetings-calendar-day">
              {dayMeetings.map(meeting => (
                <li key={meeting._id}>
                  <button
                    type="button"
                    className={`meetings-calendar-item meetings-calendar-item-${meeting.status}`}
                    title={`${meeting.title}\n${formatMeetingTime(meeting.startsAt, meeting.endsAt)}`}
                    onClick={event => {
                      event.stopPropagation();
                      onOpenMeeting(meeting._id);
                    }}
                  >
                    <span className="meetings-calendar-time">
                      {dayjs(Number(meeting.startsAt)).format('h:mm a')}
                    </span>{' '}
                    {meeting.title}
                  </button>
                </li>
              ))}
            </ul>
          );
        }}
      />
      {totalResults > CALENDAR_LIMIT ? (
        <Typography.Text type="secondary">
          Showing the first {CALENDAR_LIMIT} meetings of this month.
        </Typography.Text>
      ) : null}
    </Spin>
  );

  return (
    <div className="meetings-board">
      {header}
      {mode === 'calendar' ? calendar : table}
      <MeetingFormModal
        open={creating}
        members={members}
        initialDate={mode === 'calendar' ? selectedDate : null}
        onCancel={() => setCreating(false)}
        onSubmit={async (details, participantIds) => {
          try {
            const meeting = await provider.createMeeting(
              details,
              participantIds
            );
            message.success(
              `Meeting scheduled for ${dayjs(Number(meeting.startsAt)).format(Formats.DATE_TIME_FORMAT)}`,
              2
            );
            setCreating(false);
            onOpenMeeting(meeting._id);
          } catch (error) {
            showError(error);
          }
        }}
      />
    </div>
  );
};

export default MeetingsBoard;
