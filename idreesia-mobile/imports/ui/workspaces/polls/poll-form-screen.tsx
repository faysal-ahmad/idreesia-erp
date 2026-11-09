import React, { type ReactNode, useEffect, useMemo, useState } from 'react';
import { ActionSheet, Button, DatePicker, Dialog, Form, Input, List, Switch, TextArea } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { AddCircleOutline, PieOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { Page, PageEmpty, PageError, PageLoading, useNavigateBack, showError, showSuccess } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { choiceHint, formatDay, formatTime, toDate } from './format';
import { MOBILE_CREATE_POLL, MOBILE_UPDATE_POLL } from './gql';
import { type QuestionDraft, QuestionEditorPopup } from './question-editor-popup';
import { usePoll } from './use-poll';

interface FormValues {
  title: string;
  description?: string;
  closesAt: Date;
  anonymous: boolean;
}

const MAX_QUESTIONS = 50;

const formatPicked = (value?: Date | null) => (value ? `${formatDay(value)}, ${formatTime(value)}` : 'Choose');

/** Tomorrow at the next full hour, for a new poll's default end time. */
const tomorrow = () => {
  const date = new Date(Date.now() + 24 * 3600e3);
  date.setMinutes(0, 0, 0);
  return date;
};

/**
 * New poll (under /polls/new, saved as a draft) or editing one (under
 * /polls/:pollId/edit). A draft's questions and anonymity can change; once it is open only its title, description, end time and
 * results setting can.
 */
export const PollFormScreen = () => {
  const { committeeId, pollId } = useParams<{ committeeId: string; pollId?: string }>();
  const isEdit = Boolean(pollId);
  const history = useHistory();
  const client = useApolloClient();
  const [form] = Form.useForm<FormValues>();
  const { poll, questions: savedQuestions, loading, error, refetch } = usePoll(committeeId, pollId ?? '', {
    skip: !isEdit,
  });
  const [questions, setQuestions] = useState<QuestionDraft[] | null>(null);
  const [closesOpen, setClosesOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionDraft | 'new' | null>(null);
  const [menuQuestion, setMenuQuestion] = useState<QuestionDraft | null>(null);
  const [createPoll, { loading: creating }] = useMutation(MOBILE_CREATE_POLL);
  const [updatePoll, { loading: updating }] = useMutation(MOBILE_UPDATE_POLL);

  const backTo = isEdit
    ? WorkspacesPaths.committeePoll(committeeId, pollId!)
    : WorkspacesPaths.committeePolls(committeeId);
  const navigateBack = useNavigateBack(backTo);
  const isDraft = !isEdit || poll?.status === 'draft';

  const initialQuestions = useMemo<QuestionDraft[]>(
    () =>
      savedQuestions.map(question => ({
        key: question._id,
        _id: question._id,
        text: question.text ?? '',
        description: question.description ?? null,
        type: question.type === 'multiple' ? 'multiple' : 'single',
        required: question.required ?? true,
        minChoices: question.minChoices ?? null,
        maxChoices: question.maxChoices ?? null,
        options: question.options.map(option => ({ key: option._id, _id: option._id, text: option.text ?? '' })),
      })),
    [savedQuestions],
  );
  const shownQuestions = questions ?? initialQuestions;

  const initialValues = useMemo<Partial<FormValues>>(() => {
    if (isEdit) {
      return poll
        ? {
            title: poll.title ?? '',
            description: poll.description ?? '',
            closesAt: toDate(poll.closesAt) ?? undefined,
            anonymous: !!poll.anonymous,
          }
        : {};
    }
    return { closesAt: tomorrow(), anonymous: false };
  }, [isEdit, poll]);

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const page = (children: ReactNode) => (
    <Page backTo={backTo} title={isEdit ? 'Edit poll' : 'New poll'}>
      {children}
    </Page>
  );

  if (isEdit && loading) return page(<PageLoading />);
  if (isEdit && error) return page(<PageError error={error} onRetry={refetch} />);
  if (isEdit && !poll) return page(<PageEmpty icon={<PieOutline />} title="Poll not found" />);

  const setQuestionList = (next: QuestionDraft[]) => setQuestions(next);

  const handleSubmit = async (values: FormValues) => {
    const input = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      closesAt: String(values.closesAt.getTime()),
      anonymous: !!values.anonymous,
      questions: isDraft
        ? shownQuestions.map(question => ({
            _id: question._id ?? null,
            text: question.text,
            description: question.description ?? null,
            type: question.type,
            required: question.required,
            minChoices: question.minChoices ?? null,
            maxChoices: question.maxChoices ?? null,
            options: question.options.map(option => ({ _id: option._id ?? null, text: option.text })),
          }))
        : [],
    };
    try {
      if (isEdit) {
        await updatePoll({ variables: { committeeId, pollId: pollId!, input } });
        showSuccess('Poll saved.');
        client.refetchQueries({ include: ['mobileWorkspacePolls'] });
        navigateBack();
      } else {
        const { data } = await createPoll({ variables: { committeeId, input } });
        showSuccess('Poll saved as a draft.');
        client.refetchQueries({ include: ['mobileWorkspacePolls'] });
        const newId = data?.workspaceCreatePoll?._id;
        // Open the new poll in place of the form, so back goes to the list.
        if (newId) history.replace(WorkspacesPaths.committeePoll(committeeId, newId));
        else navigateBack();
      }
    } catch (saveError) {
      showError(saveError, 'Could not save the poll.');
    }
  };

  const menuIndex = menuQuestion ? shownQuestions.findIndex(q => q.key === menuQuestion.key) : -1;
  const move = (by: number) => {
    const next = [...shownQuestions];
    const [moved] = next.splice(menuIndex, 1);
    next.splice(menuIndex + by, 0, moved);
    setQuestionList(next);
  };
  const menuActions: Action[] = menuQuestion
    ? [
        { key: 'edit', text: 'Edit', onClick: () => setEditing(menuQuestion) },
        ...(menuIndex > 0 ? [{ key: 'up', text: 'Move up', onClick: () => move(-1) }] : []),
        ...(menuIndex < shownQuestions.length - 1 ? [{ key: 'down', text: 'Move down', onClick: () => move(1) }] : []),
        {
          key: 'remove',
          text: 'Remove',
          danger: true,
          onClick: async () => {
            const confirmed = await Dialog.confirm({
              content: `Remove "${menuQuestion.text}"?`,
              confirmText: <span className="poll-danger-text">Remove</span>,
              cancelText: 'Cancel',
            });
            if (confirmed) setQuestionList(shownQuestions.filter(q => q.key !== menuQuestion.key));
          },
        },
      ]
    : [];

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
            {isEdit ? 'Save changes' : 'Save draft'}
          </Button>
        }
      >
        <Form.Item label="Title" name="title" rules={[{ required: true, whitespace: true, message: 'Please enter a title.' }]}>
          <Input autoCapitalize="sentences" autoComplete="off" clearable maxLength={255} placeholder="Title" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={10000} placeholder="What it's about" />
        </Form.Item>
        <Form.Item
          label="Voting ends"
          name="closesAt"
          trigger="onConfirm"
          rules={[
            { required: true, message: 'Please choose when voting ends.' },
            {
              validator: (_, value?: Date) =>
                value && value.getTime() <= Date.now()
                  ? Promise.reject(new Error('Please choose a time in the future.'))
                  : Promise.resolve(),
            },
          ]}
          onClick={() => setClosesOpen(true)}
        >
          <DatePicker min={new Date()} precision="minute" visible={closesOpen} onClose={() => setClosesOpen(false)}>
            {value => formatPicked(value)}
          </DatePicker>
        </Form.Item>
        <Form.Item
          childElementPosition="right"
          disabled={!isDraft}
          label="Anonymous"
          layout="horizontal"
          name="anonymous"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Header>Questions</Form.Header>
        {isDraft ? (
          <Form.Item>
            {shownQuestions.length > 0 && (
              <List className="poll-form-questions">
                {shownQuestions.map((question, index) => (
                  <List.Item
                    key={question.key}
                    description={`${choiceHint({ ...question, optionCount: question.options.length })} · ${
                      question.options.length
                    } options${question.required ? '' : ' · optional'}`}
                    prefix={<span className="poll-question-number">{index + 1}</span>}
                    onClick={() => setMenuQuestion(question)}
                  >
                    {question.text}
                  </List.Item>
                ))}
              </List>
            )}
            {shownQuestions.length === 0 && (
              <p className="poll-muted">Add the questions members will vote on.</p>
            )}
            {shownQuestions.length < MAX_QUESTIONS && (
              <Button block color="primary" fill="outline" onClick={() => setEditing('new')}>
                <AddCircleOutline /> Add question
              </Button>
            )}
          </Form.Item>
        ) : (
          <Form.Item>
            <p className="poll-muted">
              The questions and anonymity can&apos;t change once the poll is open.
            </p>
          </Form.Item>
        )}
      </Form>

      <ActionSheet
        actions={menuActions}
        cancelText="Close"
        closeOnAction
        visible={!!menuQuestion}
        onClose={() => setMenuQuestion(null)}
      />

      <QuestionEditorPopup
        question={editing}
        onClose={() => setEditing(null)}
        onSave={saved => {
          setQuestionList(
            editing === 'new'
              ? [...shownQuestions, saved]
              : shownQuestions.map(q => (q.key === saved.key ? saved : q)),
          );
          setEditing(null);
        }}
      />
    </>,
  );
};

