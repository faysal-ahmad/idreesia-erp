import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Alert, Button, ConfigProvider, Table, Typography } from 'antd';

import { ImageVectorStatus } from 'meteor/idreesia-common/constants';
import Camera from '/imports/ui/modules/helpers/controls/picture/camera';

const CameraWidth = 640;
const CameraHeight = 480;

const PageStyle: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  padding: '32px 48px',
  position: 'relative',
};

// Camera view: everything centered on the screen.
const CameraViewStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'center',
  gap: '16px',
};

// Result view (portrait): a single column. Image and name, then the tables, then the buttons.
const ResultViewStyle: CSSProperties = {
  display: 'flex',
  width: '100%',
  maxWidth: CameraWidth * 1.5,
  height: '100%',
  flexFlow: 'column nowrap',
  alignItems: 'stretch',
  gap: '12px',
};

// The result view fits the screen (an iPad in portrait) without page scrolling.
const ResultPageStyle: CSSProperties = {
  ...PageStyle,
  height: '100dvh',
  minHeight: 0,
  overflow: 'hidden',
  padding: '16px 24px',
};

// Duty tables: take their natural height, and only scroll if there are too many duties to fit.
const TablesStyle: CSSProperties = {
  flex: '0 1 auto',
  minHeight: 0,
  overflowY: 'auto',
};

const TableTitleStyle: CSSProperties = {
  textAlign: 'center',
  margin: '0 0 8px',
};

const SectionTitleStyle: CSSProperties = {
  ...TableTitleStyle,
  marginTop: '12px',
};

// Messages are read from a distance at the kiosk.
const MessageStyle: CSSProperties = {
  fontSize: '24px',
  padding: '12px 20px',
};

// Space between a button's text and its countdown.
const CountdownStyle: CSSProperties = {
  marginLeft: '16px',
};

// The check in / out confirmation, across the top of the camera screen.
const TopNoticeStyle: CSSProperties = {
  position: 'absolute',
  top: '32px',
  left: '48px',
  right: '48px',
  display: 'flex',
  justifyContent: 'center',
};

const ActionMessageStyle: CSSProperties = {
  ...MessageStyle,
  marginTop: '12px',
};

const ActionsStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'column nowrap',
  gap: '12px',
  marginTop: '4px',
};

// Big, full-width touch targets: the check in / out and fetch buttons.
const ActionButtonStyle: CSSProperties = {
  height: '64px',
  fontSize: '26px',
};

// Read from a distance at the kiosk, so larger than the default table text.
const TableTheme = {
  components: {
    Table: {
      cellFontSize: 20,
      cellFontSizeMD: 20,
      cellFontSizeSM: 20,
      cellPaddingBlock: 8,
      cellPaddingBlockMD: 8,
      cellPaddingBlockSM: 8,
      // Darker than the default so the grid is visible from a distance.
      borderColor: '#8c8c8c',
      headerBorderRadius: 0,
    },
  },
};

const NameStyle: CSSProperties = {
  alignSelf: 'stretch',
  margin: 0,
  textAlign: 'center',
};

// Same box as the camera, so the layout doesn't shift between the two views. Shown empty
// when the karkun has no photo.
const ImageFrameStyle: CSSProperties = {
  width: '100%',
  // Takes whatever height the rest of the screen leaves over.
  flex: '1 1 0',
  minHeight: '96px',
  boxSizing: 'border-box',
  border: '1px solid #d9d9d9',
  background: '#fafafa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ImageStyle: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
};

const StatusMessages: Record<string, string> = {
  [ImageVectorStatus.NO_FACE]: 'No face was detected. Please look at the camera.',
  [ImageVectorStatus.MULTIPLE_FACES]: 'More than one face was detected. Please stand alone in front of the camera.',
  [ImageVectorStatus.TOO_SMALL]: 'Your face is too small. Please move closer.',
  [ImageVectorStatus.BLURRY]: 'The picture is blurry. Please hold still and try again.',
  [ImageVectorStatus.FACE_TURNED]: 'Please look straight at the camera.',
};
// How long a record stays on screen untouched, and how long the check in / out confirmation shows.
const ResultTimeoutSeconds = 30;
const NoticeTimeoutMs = 8000;
const GenericError = 'Something went wrong. Please try again.';
const NoMatchMessage = 'No matching record was found.';

interface DutyAttendance {
  key: string;
  dutyName: string;
  locationName: string;
  shiftName: string;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  percentage: number;
}

interface UpcomingDuty {
  key: string;
  dutyName: string;
  locationName: string;
  shiftName: string;
  startTime: string | null;
  endTime: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
}

interface KarkunMatch {
  token: string;
  name: string | null;
  imageUrl: string | null;
  monthName: string;
  attendance: DutyAttendance[];
  upcomingDuties: UpcomingDuty[];
}

// Location and shift, under the duty name.
const DutyDetailStyle: CSSProperties = {
  fontSize: '14px',
  color: '#595959',
};

const UpcomingColumns = [
  {
    title: 'Duty',
    dataIndex: 'dutyName',
    key: 'dutyName',
    width: '50%',
    render: (dutyName: string, row: UpcomingDuty) => (
      <div>
        <div>{dutyName}</div>
        <div style={DutyDetailStyle}>
          {[row.locationName, row.shiftName].filter(Boolean).join(' · ')}
        </div>
      </div>
    ),
  },
  {
    title: 'Time',
    key: 'time',
    width: '50%',
    render: (_: unknown, row: UpcomingDuty) => (
      <div>
        <div>{row.startTime && row.endTime ? `${row.startTime} - ${row.endTime}` : ''}</div>
        {row.checkedInAt ? (
          <div style={DutyDetailStyle}>
            In {row.checkedInAt}
            {row.checkedOutAt ? ` · Out ${row.checkedOutAt}` : ''}
          </div>
        ) : null}
      </div>
    ),
  },
];

const AttendanceColumns = [
  {
    title: 'Duty',
    dataIndex: 'dutyName',
    key: 'dutyName',
    render: (dutyName: string, row: DutyAttendance) => (
      <div>
        <div>{dutyName}</div>
        <div style={DutyDetailStyle}>
          {[row.locationName, row.shiftName].filter(Boolean).join(' · ')}
        </div>
      </div>
    ),
  },
  {
    title: 'P',
    dataIndex: 'presentCount',
    key: 'presentCount',
    width: 64,
    align: 'center' as const,
  },
  {
    title: 'L',
    dataIndex: 'lateCount',
    key: 'lateCount',
    width: 64,
    align: 'center' as const,
  },
  {
    title: 'A',
    dataIndex: 'absentCount',
    key: 'absentCount',
    width: 64,
    align: 'center' as const,
  },
  {
    title: '%',
    dataIndex: 'percentage',
    key: 'percentage',
    width: 84,
    align: 'center' as const,
  },
];

// Public attendance kiosk (no login required). Routed ahead of the auth check in app.tsx.
export const AttendancePage = () => {
  const cameraRef = useRef<Camera | null>(null);
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<KarkunMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  // Shown on the camera screen after a check in / out, which returns to it.
  const [notice, setNotice] = useState<string | null>(null);
  // Seconds until the record goes away by itself.
  const [secondsLeft, setSecondsLeft] = useState(ResultTimeoutSeconds);
  const [acting, setActing] = useState<'check-in' | 'check-out' | null>(null);

  const reset = () => {
    setMatch(null);
    setActionMessage(null);
  };

  // Nobody is left looking at someone else's record: go back to the camera when idle.
  useEffect(() => {
    if (!match) return undefined;
    setSecondsLeft(ResultTimeoutSeconds);
    const timer = setInterval(() => setSecondsLeft(seconds => seconds - 1), 1000);
    return () => clearInterval(timer);
  }, [match]);

  useEffect(() => {
    if (match && secondsLeft <= 0) reset();
  }, [match, secondsLeft]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), NoticeTimeoutMs);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleFetchRecord = async () => {
    const imageData = cameraRef.current?.capture();
    if (!imageData) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/attendance/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.match) {
        setActionMessage(null);
        setNotice(null);
        setMatch(result.match);
      } else if (result.status === ImageVectorStatus.COMPUTED) {
        setError(NoMatchMessage);
      } else {
        setError(StatusMessages[result.status] ?? GenericError);
      }
    } catch {
      setError(GenericError);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'check-in' | 'check-out') => {
    if (!match) return;

    setActing(action);
    setActionMessage(null);
    try {
      const response = await fetch(`/api/attendance/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: match.token }),
      });
      const result = await response.json();
      if (!response.ok) {
        setActionMessage({ type: 'error', text: result.error ?? GenericError });
        return;
      }
      if (!result.match) {
        setActionMessage({ type: 'error', text: NoMatchMessage });
        return;
      }

      setNotice(
        `${result.match.name ?? ''}: ${action === 'check-in' ? 'checked in' : 'checked out'}.`
      );
      reset();
    } catch {
      setActionMessage({ type: 'error', text: GenericError });
    } finally {
      setActing(null);
    }
  };

  // Checked in to a duty and not yet out: only check out is possible. Otherwise check in,
  // while there is a duty left to check in to.
  const isCheckedIn =
    match?.upcomingDuties.some(duty => duty.checkedInAt && !duty.checkedOutAt) ?? false;
  const canCheckIn =
    !isCheckedIn && (match?.upcomingDuties.some(duty => !duty.checkedInAt) ?? false);

  // Only the next duty that is not finished (no check in, or checked in and not yet out).
  const nextDuty = match?.upcomingDuties.find(
    duty => !duty.checkedInAt || !duty.checkedOutAt
  );

  if (match) {
    return (
      <div style={ResultPageStyle}>
        <div style={ResultViewStyle}>
          <div style={ImageFrameStyle}>
            {match.imageUrl ? (
              <img src={match.imageUrl} alt={match.name ?? ''} style={ImageStyle} />
            ) : null}
          </div>
          <Typography.Title level={3} style={NameStyle}>
            {match.name}
          </Typography.Title>
          <div style={TablesStyle}>
            <Typography.Title level={3} style={TableTitleStyle}>{match.monthName} Attendance</Typography.Title>
            <ConfigProvider theme={TableTheme}>
              <Table
                size="middle"
                bordered
                rowKey="key"
                pagination={false}
                columns={AttendanceColumns}
                dataSource={match.attendance}
                locale={{ emptyText: 'No duties assigned this month.' }}
              />
              <Typography.Title level={3} style={SectionTitleStyle}>
                Next Duty Today
              </Typography.Title>
              <Table
                size="middle"
                bordered
                rowKey="key"
                pagination={false}
                tableLayout="fixed"
                columns={UpcomingColumns}
                dataSource={nextDuty ? [nextDuty] : []}
                locale={{ emptyText: 'No more duties today.' }}
              />
            </ConfigProvider>
          </div>
            {actionMessage ? (
              <Alert
                style={ActionMessageStyle}
                type={actionMessage.type}
                showIcon
                message={actionMessage.text}
              />
            ) : null}
            <div style={ActionsStyle}>
              {isCheckedIn ? (
                <Button
                  type="primary"
                  size="large"
                  block
                  style={ActionButtonStyle}
                  loading={acting === 'check-out'}
                  disabled={acting !== null}
                  onClick={() => handleAction('check-out')}
                >
                  Check Out
                </Button>
              ) : null}
              {canCheckIn ? (
                <Button
                  type="primary"
                  size="large"
                  block
                  style={ActionButtonStyle}
                  loading={acting === 'check-in'}
                  disabled={acting !== null}
                  onClick={() => handleAction('check-in')}
                >
                  Check In
                </Button>
              ) : null}
              <Button
                type="primary"
                danger
                size="large"
                block
                style={ActionButtonStyle}
                onClick={reset}
              >
                Go back
                <span style={CountdownStyle}>({Math.max(secondsLeft, 0)})</span>
              </Button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div style={PageStyle}>
      {notice ? (
        <div style={TopNoticeStyle}>
          <Alert style={MessageStyle} type="success" showIcon message={notice} />
        </div>
      ) : null}
      <div style={CameraViewStyle}>
        <Camera
          ref={(camera) => {
            cameraRef.current = camera;
          }}
          width={CameraWidth}
          height={CameraHeight}
        />
        {error ? <Alert style={MessageStyle} type="warning" showIcon message={error} /> : null}
        <Button
          type="primary"
          size="large"
          block
          style={ActionButtonStyle}
          loading={loading}
          onClick={handleFetchRecord}
        >
          Fetch my record
        </Button>
      </div>
    </div>
  );
};
