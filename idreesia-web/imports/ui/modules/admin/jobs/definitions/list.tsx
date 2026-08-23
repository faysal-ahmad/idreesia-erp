import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Modal, Popconfirm, Radio, Spin, Switch, Table, Tooltip } from 'antd';
import { Cron } from 'react-js-cron';
import 'react-js-cron/dist/styles.css';
import { message } from '/imports/ui/antd-feedback';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllJobDefinitionsQuery } from 'meteor/idreesia-common/types/client-operations';

import {
  ALL_JOB_DEFINITIONS,
  CLEAR_JOB_DEFINITION_SCHEDULE,
  RESET_JOB_DEFINITION_SCHEDULE,
  RUN_SCHEDULED_JOB_NOW,
  SET_JOB_DEFINITION_ENABLED,
  UPDATE_JOB_DEFINITION_SCHEDULE,
} from '../gql';

type JobDefinitionRow = NonNullable<
  NonNullable<AllJobDefinitionsQuery['allJobDefinitions']>[number]
>;

type ScheduleMode = 'none' | 'recurring';

const DEFAULT_SCHEDULE = '0 2 1 * *';

const List = () => {
  useBreadcrumbs(['Admin', 'Scheduled Jobs', 'Job Definitions']);

  const { data, loading, refetch } = useQuery(ALL_JOB_DEFINITIONS);
  const [updateJobDefinitionSchedule] = useMutation(UPDATE_JOB_DEFINITION_SCHEDULE);
  const [clearJobDefinitionSchedule] = useMutation(CLEAR_JOB_DEFINITION_SCHEDULE);
  const [resetJobDefinitionSchedule] = useMutation(RESET_JOB_DEFINITION_SCHEDULE);
  const [setJobDefinitionEnabled] = useMutation(SET_JOB_DEFINITION_ENABLED);
  const [runScheduledJobNow] = useMutation(RUN_SCHEDULED_JOB_NOW);

  const [editingRecord, setEditingRecord] = useState<JobDefinitionRow | null>(null);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('none');
  const [scheduleDraft, setScheduleDraft] = useState(DEFAULT_SCHEDULE);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const jobDefinitions: JobDefinitionRow[] = (data?.allJobDefinitions ?? []).filter(
    (row): row is JobDefinitionRow => row != null && row._id != null
  );

  const handleEditScheduleClicked = (record: JobDefinitionRow) => {
    setScheduleMode(record.schedule ? 'recurring' : 'none');
    setScheduleDraft(record.schedule || record.defaultSchedule || DEFAULT_SCHEDULE);
    setEditingRecord(record);
  };

  const handleCloseScheduleModal = () => {
    setEditingRecord(null);
  };

  const handleSaveSchedule = () => {
    if (!editingRecord?._id) return;

    // "No Recurring Schedule" was already the state before opening the
    // modal - nothing actually changed, so skip the round-trip.
    if (scheduleMode === 'none' && !editingRecord.schedule) {
      handleCloseScheduleModal();
      return;
    }

    setSaving(true);
    const mutationPromise =
      scheduleMode === 'none'
        ? clearJobDefinitionSchedule({ variables: { _id: editingRecord._id } })
        : updateJobDefinitionSchedule({
            variables: { _id: editingRecord._id, schedule: scheduleDraft },
          });

    mutationPromise
      .then(() => {
        message.success(
          scheduleMode === 'none'
            ? 'Schedule cleared - this job can now only be run manually.'
            : 'Schedule updated.',
          4
        );
        handleCloseScheduleModal();
        return refetch();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setSaving(false));
  };

  const handleResetClicked = () => {
    if (!editingRecord?._id) return;

    setResetting(true);
    resetJobDefinitionSchedule({ variables: { _id: editingRecord._id } })
      .then(() => {
        message.success('Schedule reset to default.', 3);
        handleCloseScheduleModal();
        return refetch();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => setResetting(false));
  };

  const handleToggleEnabled = (record: JobDefinitionRow, enabled: boolean) => {
    if (!record._id) return;

    setJobDefinitionEnabled({ variables: { _id: record._id, enabled } })
      .then(() => refetch())
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleRunNowClicked = (record: JobDefinitionRow) => {
    runScheduledJobNow({ variables: { name: record.name as string } })
      .then(() => {
        message.success(`"${record.displayName}" has been queued to run now.`, 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns: any[] = [
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string | null, record: JobDefinitionRow) => (
        <Button type="link" onClick={() => handleEditScheduleClicked(record)}>
          {schedule || 'Manual only'}
        </Button>
      ),
    },
    {
      title: 'Default Schedule',
      dataIndex: 'defaultSchedule',
      key: 'defaultSchedule',
      render: (defaultSchedule: string | null) => defaultSchedule || '—',
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: JobDefinitionRow) => (
        <Tooltip
          title={record.schedule ? undefined : 'No recurring schedule to enable or disable'}
        >
          <Switch
            checked={!!enabled}
            disabled={!record.schedule}
            onChange={checked => handleToggleEnabled(record, checked)}
          />
        </Tooltip>
      ),
    },
    {
      key: 'action',
      width: 120,
      render: (_text: unknown, record: JobDefinitionRow) => (
        <div className="list-actions-column">
          <Popconfirm
            title={`Run "${record.displayName}" now?`}
            onConfirm={() => handleRunNowClicked(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small">Run Now</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="list-container">
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={jobDefinitions}
          columns={columns}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
        />
      </div>

      <Modal
        title="Edit Schedule"
        open={!!editingRecord}
        width={640}
        onCancel={handleCloseScheduleModal}
        destroyOnHidden
        footer={[
          <Button
            key="reset"
            disabled={editingRecord?.schedule === editingRecord?.defaultSchedule}
            loading={resetting}
            onClick={handleResetClicked}
          >
            Reset to Default
          </Button>,
          <Button key="cancel" onClick={handleCloseScheduleModal}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={saving} onClick={handleSaveSchedule}>
            Save
          </Button>,
        ]}
      >
        <Radio.Group
          value={scheduleMode}
          onChange={event => setScheduleMode(event.target.value as ScheduleMode)}
          style={{ display: 'flex', flexDirection: 'column', rowGap: 12, width: '100%' }}
        >
          <Radio value="none">No Recurring Schedule</Radio>
          <Radio value="recurring">Recurring Schedule</Radio>
          {scheduleMode === 'recurring' ? (
            <div style={{ marginLeft: 24 }}>
              <Cron value={scheduleDraft} setValue={setScheduleDraft} clearButton={false} />
            </div>
          ) : null}
        </Radio.Group>
      </Modal>
    </>
  );
};

export default List;
