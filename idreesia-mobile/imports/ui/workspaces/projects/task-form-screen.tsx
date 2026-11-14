import React, { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, Selector, TextArea } from 'antd-mobile';
import { CheckCircleOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess, useNavigateBack } from '../../layout';
import { useHistory, useLocation, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { endOfDay, formatDay, TASK_PRIORITIES, toDate } from './format';
import { MOBILE_CREATE_TASK, MOBILE_UPDATE_TASK } from './gql';
import { MemberPickerPopup } from './member-picker-popup';
import { useTaskBackTo } from './task-screen';
import { useProject, useProjectsInfo, useTask } from './use-projects';

interface FormValues {
  title: string;
  description?: string;
  priority: string[];
  dueDate?: Date | null;
}

const formatPicked = (value?: Date | null) => (value ? formatDay(value) : 'No due date');

/**
 * New task (under /tasks/new, optionally `?projectId=` for a task of that
 * project) or editing one (under /tasks/:taskId/edit). Assigning a project
 * task to someone who isn't a participant makes them one.
 */
export const TaskFormScreen = () => {
  const { committeeId, taskId } = useParams<{ committeeId: string; taskId?: string }>();
  const isEdit = Boolean(taskId);
  const history = useHistory();
  const { search } = useLocation();
  const client = useApolloClient();
  const online = useOnlineStatus();
  const [form] = Form.useForm<FormValues>();
  const { members } = useProjectsInfo(committeeId);
  const { task, loading, error, refetch } = useTask(committeeId, taskId ?? '', { skip: !isEdit });
  const projectId = isEdit ? (task?.projectId ?? null) : new URLSearchParams(search).get('projectId');
  const { project } = useProject(committeeId, projectId ?? '', { skip: !projectId });
  const [assigneeId, setAssigneeId] = useState<string | null | undefined>(undefined);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dueOpen, setDueOpen] = useState(false);
  const [createTask, { loading: creating }] = useMutation(MOBILE_CREATE_TASK);
  const [updateTask, { loading: updating }] = useMutation(MOBILE_UPDATE_TASK);

  const from = useTaskBackTo(committeeId);
  const backTo = isEdit ? WorkspacesPaths.committeeTask(committeeId, taskId!) : from;
  const navigateBack = useNavigateBack(backTo);

  const assignee = assigneeId === undefined ? (task?.assigneeId ?? null) : assigneeId;
  const assigneeName =
    members.find(member => member.personId === assignee)?.name ?? (assignee === task?.assigneeId ? task?.assigneeName : null);

  const initialValues = useMemo<Partial<FormValues>>(() => {
    if (!isEdit) return { priority: ['normal'] };
    if (!task) return {};
    return {
      title: task.title ?? '',
      description: task.description ?? '',
      priority: [task.priority ?? 'normal'],
      dueDate: toDate(task.dueDate),
    };
  }, [isEdit, task]);
  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const page = (children: ReactNode) => (
    <Page backTo={backTo} title={isEdit ? 'Edit task' : 'New task'}>
      {children}
    </Page>
  );

  if (isEdit && loading) return page(<PageLoading />);
  if (isEdit && error) return page(<PageError error={error} onRetry={refetch} />);
  if (isEdit && !task) return page(<PageEmpty icon={<CheckCircleOutline />} title="Task not found" />);

  const handleSubmit = async (values: FormValues) => {
    const input = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      assigneeId: assignee ?? null,
      dueDate: values.dueDate ? endOfDay(values.dueDate) : null,
      priority: values.priority?.[0] ?? 'normal',
      ...(isEdit ? {} : { projectId }),
    };
    try {
      if (isEdit) {
        await updateTask({ variables: { committeeId, taskId: taskId!, input } });
        showSuccess('Task saved.');
        client.refetchQueries({ include: ['mobileWorkspaceTasks'] });
        navigateBack();
      } else {
        const { data } = await createTask({ variables: { committeeId, input } });
        showSuccess('Task created.');
        client.refetchQueries({ include: ['mobileWorkspaceTasks', 'mobileWorkspaceProjects'] });
        const newId = data?.workspaceCreateTask?._id;
        // Open the new task in place of the form, so back goes where it was opened from.
        if (newId) history.replace(WorkspacesPaths.committeeTask(committeeId, newId), { from });
        else navigateBack();
      }
    } catch (saveError) {
      showError(saveError, 'Could not save the task.');
    }
  };

  const newInProject = !isEdit && !!projectId;
  const projectTitle = (isEdit ? task?.projectTitle : project?.title) ?? null;

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
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        }
      >
        {(newInProject || (isEdit && projectTitle)) && (
          <Form.Item label="Project">
            <span className="project-muted">{projectTitle ?? 'Loading…'}</span>
          </Form.Item>
        )}
        <Form.Item label="Title" name="title" rules={[{ required: true, whitespace: true, message: 'Please enter a title.' }]}>
          <Input autoCapitalize="sentences" autoComplete="off" clearable maxLength={255} placeholder="Title" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={10000} placeholder="What needs to be done" />
        </Form.Item>
        <Form.Item
          arrowIcon
          description={projectId ? 'Someone who isn’t in the project is added to it.' : undefined}
          label="Assigned to"
          onClick={() => setPickerOpen(true)}
        >
          {assigneeName ?? 'Nobody'}
        </Form.Item>
        <Form.Item label="Due date" name="dueDate" trigger="onConfirm" onClick={() => setDueOpen(true)}>
          <DatePicker visible={dueOpen} onClose={() => setDueOpen(false)}>
            {value => formatPicked(value)}
          </DatePicker>
        </Form.Item>
        <Form.Item label="Priority" name="priority">
          <Selector
            columns={4}
            options={Object.entries(TASK_PRIORITIES).map(([value, { label }]) => ({ value, label }))}
          />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(previous, next) => previous.dueDate !== next.dueDate}>
          {() =>
            form.getFieldValue('dueDate') ? (
              <Form.Item>
                <Button block fill="none" size="small" onClick={() => form.setFieldValue('dueDate', null)}>
                  Clear due date
                </Button>
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </Form>

      <MemberPickerPopup
        allowNone
        confirmText="Choose"
        members={members}
        selectedIds={assignee ? [assignee] : []}
        title="Assigned to"
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={ids => {
          setAssigneeId(ids[0] ?? null);
          setPickerOpen(false);
        }}
      />
    </>,
  );
};
