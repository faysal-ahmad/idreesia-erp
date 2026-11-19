import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { SyncOutlined } from '@ant-design/icons';
import { Button, DatePicker, Empty, Space, Spin, Table, Tag } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type { WorkspaceDaPlanDaysQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import AttendanceMark, { asStatus, type AttendanceStatus } from './attendance-mark';
import { todayInKarachi } from './dates';
import DutySelect from './duty-select';
import { WORKSPACE_DA_PLAN_DAYS, WORKSPACE_DA_SET_ATTENDANCE } from './gql';
import { useDuties, useDutiesAttendanceAccess } from './hooks';

type PlanDays = NonNullable<WorkspaceDaPlanDaysQuery['workspaceDaPlanDays']>;
type PlanDay = NonNullable<NonNullable<PlanDays['days']>[number]>;
type PlanKarkun = NonNullable<NonNullable<PlanDay['karkuns']>[number]>;

// Marks who was present, late or absent on a duty, for today or an earlier day.
const AttendancePage = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const today = todayInKarachi();
  const { duties, loading: dutiesLoading } = useDuties(locationId);
  const { canMarkAttendance } = useDutiesAttendanceAccess(locationId);
  const [selectedDutyId, setSelectedDutyId] = useState('');
  const [date, setDate] = useState(today);
  const [savingKarkunId, setSavingKarkunId] = useState<string | null>(null);

  // Duties that were retired can still have days to mark.
  const dutyId = duties.some(duty => duty._id === selectedDutyId)
    ? selectedDutyId
    : (duties.find(duty => duty.isActive)?._id ?? duties[0]?._id ?? '');

  const { data, loading, refetch } = useQuery(WORKSPACE_DA_PLAN_DAYS, {
    variables: { locationId, dutyId, startDate: date },
    skip: !dutyId,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const [setAttendance] = useMutation(WORKSPACE_DA_SET_ATTENDANCE);

  const day = data?.workspaceDaPlanDays?.startDate === date
    ? data.workspaceDaPlanDays.days?.find(item => item?.date === date)
    : undefined;
  const karkuns = (day?.karkuns ?? []).filter(
    (karkun): karkun is PlanKarkun => karkun?.karkunId != null
  );

  const countOf = (status: AttendanceStatus | null) =>
    karkuns.filter(karkun => asStatus(karkun.attendance) === status).length;
  const counts = {
    present: countOf('present'),
    late: countOf('late'),
    absent: countOf('absent'),
    unset: countOf(null),
  };

  const handleChange = (karkunId: string, status: AttendanceStatus | null) => {
    setSavingKarkunId(karkunId);
    setAttendance({
      variables: { locationId, dutyId, date, karkunId, status },
    })
      .then(() => refetch())
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setSavingKarkunId(null));
  };

  const columns: any[] = [
    {
      title: 'Name',
      key: 'name',
      render: (_text: unknown, karkun: PlanKarkun) => (
        <Space size={8}>
          <PersonName
            person={{
              _id: karkun.karkunId,
              name: karkun.name,
              imageUrl: karkun.imageUrl,
              imageThumbnailUrl: karkun.imageThumbnailUrl,
            }}
          />
          {karkun.addedForDay ? <Tag>Added for the day</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Attendance',
      key: 'attendance',
      width: 140,
      align: 'center',
      render: (_text: unknown, karkun: PlanKarkun) => (
        <AttendanceMark
          status={asStatus(karkun.attendance)}
          editable={canMarkAttendance}
          saving={savingKarkunId === karkun.karkunId}
          onChange={status => handleChange(karkun.karkunId, status)}
        />
      ),
    },
  ];

  if (dutiesLoading && duties.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="da-page">
      <div className="da-selection">
        <Space size={12}>
          <span className="da-select-label">Duty</span>
          <DutySelect
            duties={duties}
            value={dutyId || undefined}
            onChange={setSelectedDutyId}
          />
        </Space>
        <Space size={8}>
          <DatePicker
            className="da-date-picker"
            format="DD MMM, YYYY"
            allowClear={false}
            value={dayjs(date)}
            disabledDate={current => current.format('YYYY-MM-DD') > today}
            onChange={value => {
              if (value) setDate(value.format('YYYY-MM-DD'));
            }}
          />
          <Button
            icon={<SyncOutlined />}
            title="Reload Data"
            loading={loading}
            disabled={!dutyId}
            onClick={() => refetch()}
          />
        </Space>
      </div>

      {duties.length === 0 ? (
        <Empty description="There are no duties yet. Add one on the Duties page." />
      ) : (
        <div className="list-container">
          <Table
            className="list-table"
            rowKey="karkunId"
            dataSource={karkuns}
            columns={columns}
            title={() => (
              <div className="list-table-header">
                <Space size={12}>
                  <span className="da-range">
                    {dayjs(date).format('dddd, DD MMM, YYYY')}
                  </span>
                </Space>
                <div className="list-table-header-utilities">
                  <Space size={8}>
                    <Tag color="green">Present {counts.present}</Tag>
                    <Tag color="orange">Late {counts.late}</Tag>
                    <Tag color="red">Absent {counts.absent}</Tag>
                    <Tag>Not marked {counts.unset}</Tag>
                  </Space>
                </div>
              </div>
            )}
            loading={loading && !day}
            bordered
            size="middle"
            tableLayout="fixed"
            pagination={false}
            locale={{ emptyText: 'Nobody was on duty on this day' }}
          />
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
