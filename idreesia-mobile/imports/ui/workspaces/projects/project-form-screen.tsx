import React, { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, TextArea } from 'antd-mobile';
import { UnorderedListOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess, useNavigateBack } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { formatDay, toDate } from './format';
import { MOBILE_CREATE_PROJECT, MOBILE_UPDATE_PROJECT } from './gql';
import { MemberPickerPopup } from './member-picker-popup';
import { useProject, useProjectsInfo } from './use-projects';

interface FormValues {
  title: string;
  objective?: string;
  description?: string;
  startDate?: Date | null;
  targetDate?: Date | null;
}

const formatPicked = (value?: Date | null) => (value ? formatDay(value) : 'Choose');
const dayStart = (date: Date) => String(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());

/**
 * New project (under /projects/new) or editing one (under
 * /projects/:projectId/edit). Participants of a new project are chosen here, and managed from the Participants screen
 * afterwards.
 */
export const ProjectFormScreen = () => {
  const { committeeId, projectId } = useParams<{ committeeId: string; projectId?: string }>();
  const isEdit = Boolean(projectId);
  const history = useHistory();
  const client = useApolloClient();
  const online = useOnlineStatus();
  const [form] = Form.useForm<FormValues>();
  const { members } = useProjectsInfo(committeeId);
  const { project, loading, error, refetch } = useProject(committeeId, projectId ?? '', { skip: !isEdit });
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [picker, setPicker] = useState<'participants' | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [createProject, { loading: creating }] = useMutation(MOBILE_CREATE_PROJECT);
  const [updateProject, { loading: updating }] = useMutation(MOBILE_UPDATE_PROJECT);

  const backTo = isEdit
    ? WorkspacesPaths.committeeProject(committeeId, projectId!)
    : WorkspacesPaths.committeeProjects(committeeId);
  const navigateBack = useNavigateBack(backTo);

  const initialValues = useMemo<Partial<FormValues>>(
    () =>
      isEdit && project
        ? {
            title: project.title ?? '',
            objective: project.objective ?? '',
            description: project.description ?? '',
            startDate: toDate(project.startDate),
            targetDate: toDate(project.targetDate),
          }
        : {},
    [isEdit, project],
  );
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const page = (children: ReactNode) => (
    <Page backTo={backTo} title={isEdit ? 'Edit project' : 'New project'}>
      {children}
    </Page>
  );

  if (isEdit && loading) return page(<PageLoading />);
  if (isEdit && error) return page(<PageError error={error} onRetry={refetch} />);
  if (isEdit && !project) return page(<PageEmpty icon={<UnorderedListOutline />} title="Project not found" />);

  const handleSubmit = async (values: FormValues) => {
    const input = {
      title: values.title.trim(),
      objective: values.objective?.trim() || null,
      description: values.description?.trim() || null,
      startDate: values.startDate ? dayStart(values.startDate) : null,
      targetDate: values.targetDate ? dayStart(values.targetDate) : null,
      ...(isEdit ? {} : { participantIds }),
    };
    try {
      if (isEdit) {
        await updateProject({ variables: { committeeId, projectId: projectId!, input } });
        showSuccess('Project saved.');
        client.refetchQueries({ include: ['mobileWorkspaceProjects'] });
        navigateBack();
      } else {
        const { data } = await createProject({ variables: { committeeId, input } });
        showSuccess('Project created.');
        client.refetchQueries({ include: ['mobileWorkspaceProjects'] });
        const newId = data?.workspaceCreateProject?._id;
        // Open the new project in place of the form, so back goes to the list.
        if (newId) history.replace(WorkspacesPaths.committeeProject(committeeId, newId));
        else navigateBack();
      }
    } catch (saveError) {
      showError(saveError, 'Could not save the project.');
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
          <Button block color="primary" disabled={!online} loading={creating || updating} size="large" type="submit">
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        }
      >
        <Form.Item label="Title" name="title" rules={[{ required: true, whitespace: true, message: 'Please enter a title.' }]}>
          <Input autoCapitalize="sentences" autoComplete="off" clearable maxLength={255} placeholder="Title" />
        </Form.Item>
        <Form.Item label="Objective" name="objective">
          <TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={10000} placeholder="What the project should achieve" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={10000} placeholder="More details" />
        </Form.Item>
        <Form.Item label="Start date" name="startDate" trigger="onConfirm" onClick={() => setStartOpen(true)}>
          <DatePicker visible={startOpen} onClose={() => setStartOpen(false)}>
            {value => formatPicked(value)}
          </DatePicker>
        </Form.Item>
        <Form.Item
          label="Target date"
          name="targetDate"
          trigger="onConfirm"
          rules={[
            {
              validator: (_, value?: Date | null) => {
                const start = form.getFieldValue('startDate') as Date | null | undefined;
                return value && start && value.getTime() < start.getTime()
                  ? Promise.reject(new Error('The target date can’t be before the start date.'))
                  : Promise.resolve();
              },
            },
          ]}
          onClick={() => setTargetOpen(true)}
        >
          <DatePicker visible={targetOpen} onClose={() => setTargetOpen(false)}>
            {value => formatPicked(value)}
          </DatePicker>
        </Form.Item>
        {!isEdit && (
          <Form.Item arrowIcon label="Participants" onClick={() => setPicker('participants')}>
            {participantIds.length ? `${participantIds.length} chosen` : 'None yet'}
          </Form.Item>
        )}
      </Form>

      <MemberPickerPopup
        multiple
        confirmText="Choose"
        members={members}
        note="Only participants can use the project chat. You can change this later."
        selectedIds={participantIds}
        title="Participants"
        visible={picker === 'participants'}
        onClose={() => setPicker(null)}
        onConfirm={ids => {
          setParticipantIds(ids);
          setPicker(null);
        }}
      />
    </>,
  );
};
