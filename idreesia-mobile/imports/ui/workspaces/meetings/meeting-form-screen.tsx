import React, { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, TextArea } from 'antd-mobile';
import { CalendarOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { Page, PageEmpty, PageError, PageLoading, useNavigateBack, showError, showSuccess } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { formatDay, formatTime, toDate } from './format';
import { MOBILE_CREATE_MEETING, MOBILE_UPDATE_MEETING } from './gql';
import { MemberPickerPopup } from './member-picker-popup';
import { useMeeting, useMeetingsInfo } from './use-meeting';

interface FormValues {
  title: string;
  startsAt: Date;
  endsAt: Date;
  location?: string;
  description?: string;
}

const formatPicked = (value?: Date | null) =>
  value ? `${formatDay(value)}, ${formatTime(value)}` : 'Choose';

/** The next full hour, for a new meeting's default start. */
const nextHour = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
};

/**
 * New meeting (under /meetings/new) or editing a meeting's details (under
 * /meetings/:meetingId/edit). New meetings also pick their participants.
 */
export const MeetingFormScreen = () => {
  const { committeeId, meetingId } = useParams<{ committeeId: string; meetingId?: string }>();
  const isEdit = Boolean(meetingId);
  const history = useHistory();
  const client = useApolloClient();
  const [form] = Form.useForm<FormValues>();
  const { members } = useMeetingsInfo(committeeId);
  const { meeting, loading, error, refetch } = useMeeting(committeeId, meetingId ?? '', {
    skip: !isEdit,
  });
  const [participantIds, setParticipantIds] = useState<string[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [createMeeting, { loading: creating }] = useMutation(MOBILE_CREATE_MEETING);
  const [updateMeeting, { loading: updating }] = useMutation(MOBILE_UPDATE_MEETING);

  const backTo = isEdit
    ? WorkspacesPaths.committeeMeeting(committeeId, meetingId!)
    : WorkspacesPaths.committeeMeetings(committeeId);
  const navigateBack = useNavigateBack(backTo);

  // Everyone is invited by default.
  const allIds = useMemo(() => members.map(member => member.participantId), [members]);
  const invited = participantIds ?? allIds;

  const initialValues = useMemo<Partial<FormValues>>(() => {
    if (isEdit) {
      return meeting
        ? {
            title: meeting.title ?? '',
            startsAt: toDate(meeting.startsAt) ?? undefined,
            endsAt: toDate(meeting.endsAt) ?? undefined,
            location: meeting.location ?? '',
            description: meeting.description ?? '',
          }
        : {};
    }
    const start = nextHour();
    return { startsAt: start, endsAt: new Date(start.getTime() + 3600e3) };
  }, [isEdit, meeting]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const page = (children: ReactNode) => (
    <Page backTo={backTo} title={isEdit ? 'Edit meeting' : 'New meeting'}>
      {children}
    </Page>
  );

  if (isEdit && loading) return page(<PageLoading />);
  if (isEdit && error) return page(<PageError error={error} onRetry={refetch} />);
  if (isEdit && !meeting) {
    return page(<PageEmpty icon={<CalendarOutline />} title="Meeting not found" />);
  }

  const handleSubmit = async (values: FormValues) => {
    const input = {
      title: values.title.trim(),
      startsAt: String(values.startsAt.getTime()),
      endsAt: String(values.endsAt.getTime()),
      location: values.location?.trim() || null,
      // The form no longer edits the link; keep whatever an existing meeting has.
      onlineUrl: meeting?.onlineUrl ?? null,
      description: values.description?.trim() || null,
    };
    try {
      if (isEdit) {
        await updateMeeting({ variables: { committeeId, meetingId: meetingId!, input } });
        showSuccess('Meeting saved.');
        navigateBack();
      } else {
        const { data } = await createMeeting({
          variables: { committeeId, input, participantIds: invited },
        });
        showSuccess('Meeting scheduled.');
        client.refetchQueries({ include: ['mobileWorkspaceMeetings'] });
        const newId = data?.workspaceCreateMeeting?._id;
        // Open the new meeting in place of the form, so back goes to the list.
        if (newId) history.replace(WorkspacesPaths.committeeMeeting(committeeId, newId));
        else navigateBack();
      }
    } catch (saveError) {
      showError(saveError, 'Could not save the meeting.');
    }
  };

  return page(
    <>
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        mode="card"
        onFinish={handleSubmit}
        footer={
          <Button block color="primary" loading={creating || updating} size="large" type="submit">
            {isEdit ? 'Save changes' : 'Schedule meeting'}
          </Button>
        }
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, whitespace: true, message: 'Please enter a title.' }]}
        >
          <Input autoCapitalize="sentences" autoComplete="off" clearable maxLength={255} placeholder="Title" />
        </Form.Item>
        <Form.Item
          label="Starts"
          name="startsAt"
          rules={[{ required: true, message: 'Please choose when it starts.' }]}
          trigger="onConfirm"
          onClick={() => setStartOpen(true)}
        >
          <DatePicker
            precision="minute"
            visible={startOpen}
            onClose={() => setStartOpen(false)}
            onConfirm={value => {
              // Keep the end after the start: an hour later, if it no longer is.
              const end = form.getFieldValue('endsAt') as Date | undefined;
              if (!end || end <= value) {
                form.setFieldsValue({ endsAt: new Date(value.getTime() + 3600e3) });
              }
            }}
          >
            {value => formatPicked(value)}
          </DatePicker>
        </Form.Item>
        <Form.Item
          label="Ends"
          name="endsAt"
          trigger="onConfirm"
          dependencies={['startsAt']}
          rules={[
            { required: true, message: 'Please choose when it ends.' },
            ({ getFieldValue }) => ({
              validator: (_, value?: Date) => {
                const start = getFieldValue('startsAt') as Date | undefined;
                return value && start && value <= start
                  ? Promise.reject(new Error('It must end after it starts.'))
                  : Promise.resolve();
              },
            }),
          ]}
          onClick={() => setEndOpen(true)}
        >
          <DatePicker precision="minute" visible={endOpen} onClose={() => setEndOpen(false)}>
            {value => formatPicked(value)}
          </DatePicker>
        </Form.Item>
        <Form.Item label="Location" name="location">
          <Input autoCapitalize="sentences" clearable maxLength={1000} placeholder="Where it takes place" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={10000} placeholder="What it's about" />
        </Form.Item>
        {!isEdit && (
          <Form.Item arrowIcon label="Participants" onClick={() => setPickerOpen(true)}>
            {invited.length === allIds.length
              ? `All members (${allIds.length})`
              : `${invited.length} of ${allIds.length} members`}
          </Form.Item>
        )}
      </Form>


      <MemberPickerPopup
        confirmText="Invite"
        members={members}
        selectedIds={invited}
        title="Participants"
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={ids => {
          setParticipantIds(ids);
          setPickerOpen(false);
        }}
      />
    </>,
  );
};
