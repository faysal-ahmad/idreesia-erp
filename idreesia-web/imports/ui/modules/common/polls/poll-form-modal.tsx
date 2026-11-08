import React, { useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';

import type {
  Poll,
  PollDetails,
  PollMember,
  PollQuestionInput,
  PollQuestionType,
} from './types';

interface OptionValues {
  _id?: string | null;
  text: string;
}

interface QuestionValues {
  _id?: string | null;
  text: string;
  description?: string;
  type: PollQuestionType;
  required: boolean;
  minChoices?: number | null;
  maxChoices?: number | null;
  options: OptionValues[];
}

interface FormValues {
  title: string;
  description?: string;
  closesAt: Dayjs;
  anonymous: boolean;
  showResultsWhileOpen: boolean;
  eligibleVoterIds?: string[];
  questions?: QuestionValues[];
}

const MAX_QUESTIONS = 50;
const MAX_OPTIONS = 50;

const newQuestion = (): QuestionValues => ({
  text: '',
  type: 'single',
  required: true,
  options: [{ text: '' }, { text: '' }],
});

const toQuestionInput = (question: QuestionValues): PollQuestionInput => ({
  _id: question._id || null,
  text: question.text,
  description: question.description?.trim() || null,
  type: question.type,
  required: question.required,
  minChoices: question.type === 'multiple' ? question.minChoices ?? null : null,
  maxChoices: question.type === 'multiple' ? question.maxChoices ?? null : null,
  options: (question.options ?? []).map(option => ({
    _id: option._id || null,
    text: option.text,
  })),
});

/** Tomorrow at the same hour, for a new poll's default end time. */
const defaultClosesAt = () => dayjs().add(1, 'day').startOf('hour');

interface Props {
  open: boolean;
  /** Edit this poll; unset to create one. */
  poll?: Poll | null;
  /** Who can be made eligible to vote. */
  members: PollMember[];
  onCancel: () => void;
  onSubmit: (details: PollDetails) => Promise<void>;
}

/**
 * Create or edit a poll. A draft's questions, anonymity and eligible voters
 * can all change; once it is open only its title, description, end time
 * and results setting can.
 */
const PollFormModal = ({ open, poll, members, onCancel, onSubmit }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const isEdit = !!poll;
  const isDraft = !poll || poll.status === 'draft';

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (poll) {
      form.setFieldsValue({
        title: poll.title,
        description: poll.description ?? undefined,
        closesAt: dayjs(Number(poll.closesAt)),
        anonymous: poll.anonymous,
        showResultsWhileOpen: poll.showResultsWhileOpen,
        eligibleVoterIds:
          poll.eligibleVoterIds ?? members.map(({ voterId }) => voterId),
        questions: poll.questions.map(question => ({
          _id: question._id,
          text: question.text,
          description: question.description ?? undefined,
          type: question.type,
          required: question.required,
          minChoices: question.minChoices,
          maxChoices: question.maxChoices,
          options: question.options.map(option => ({ ...option })),
        })),
      });
    } else {
      form.setFieldsValue({
        closesAt: defaultClosesAt(),
        anonymous: false,
        showResultsWhileOpen: false,
        eligibleVoterIds: members.map(({ voterId }) => voterId),
        questions: [newQuestion()],
      });
    }
  }, [open, poll, members, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await onSubmit({
        title: values.title,
        description: values.description?.trim() || null,
        closesAt: String(values.closesAt.second(0).millisecond(0).valueOf()),
        anonymous: !!values.anonymous,
        showResultsWhileOpen: !!values.showResultsWhileOpen,
        eligibleVoterIds: values.eligibleVoterIds ?? [],
        questions: (values.questions ?? []).map(toQuestionInput),
      });
    } finally {
      setSaving(false);
    }
  };

  const questionsEditor = (
    <Form.List name="questions">
      {(questions, { add, remove, move }) => (
        <div className="poll-form-questions">
          {questions.map((question, index) => (
            <Card
              key={question.key}
              size="small"
              className="poll-form-question"
              title={`Question ${index + 1}`}
              extra={
                <Space size={4}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    title="Move up"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === questions.length - 1}
                    onClick={() => move(index, index + 1)}
                    title="Move down"
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(question.name)}
                    title="Remove question"
                  />
                </Space>
              }
            >
              <Form.Item name={[question.name, '_id']} hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name={[question.name, 'text']}
                rules={[
                  { required: true, whitespace: true, message: 'Enter the question' },
                ]}
              >
                <Input maxLength={1000} placeholder="Question" />
              </Form.Item>
              <Form.Item name={[question.name, 'description']}>
                <Input.TextArea
                  rows={1}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  maxLength={10000}
                  placeholder="Details (optional)"
                />
              </Form.Item>
              <Space size={16} align="center" wrap className="poll-form-question-settings">
                <Form.Item name={[question.name, 'type']} noStyle>
                  <Select
                    style={{ width: 170 }}
                    options={[
                      { value: 'single', label: 'One choice' },
                      { value: 'multiple', label: 'Multiple choices' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name={[question.name, 'required']}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>Required</Checkbox>
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, next) =>
                    prev.questions?.[index]?.type !== next.questions?.[index]?.type
                  }
                >
                  {() =>
                    form.getFieldValue(['questions', question.name, 'type']) ===
                    'multiple' ? (
                      <Space size={8}>
                        <Typography.Text type="secondary">Choose</Typography.Text>
                        <Form.Item name={[question.name, 'minChoices']} noStyle>
                          <InputNumber min={1} max={MAX_OPTIONS} placeholder="1" style={{ width: 70 }} />
                        </Form.Item>
                        <Typography.Text type="secondary">to</Typography.Text>
                        <Form.Item name={[question.name, 'maxChoices']} noStyle>
                          <InputNumber min={1} max={MAX_OPTIONS} placeholder="all" style={{ width: 70 }} />
                        </Form.Item>
                      </Space>
                    ) : null
                  }
                </Form.Item>
              </Space>
              <Form.List
                name={[question.name, 'options']}
                rules={[
                  {
                    validator: async (_, options?: OptionValues[]) => {
                      if (!options || options.length < 2) {
                        throw new Error('Add at least 2 options');
                      }
                    },
                  },
                ]}
              >
                {(options, optionOps, { errors }) => (
                  <div className="poll-form-options">
                    {options.map((option, optionIndex) => (
                      <Space key={option.key} align="start" className="poll-form-option">
                        <Form.Item name={[option.name, '_id']} hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={[option.name, 'text']}
                          rules={[
                            { required: true, whitespace: true, message: 'Enter the option' },
                          ]}
                        >
                          <Input
                            maxLength={255}
                            placeholder={`Option ${optionIndex + 1}`}
                            style={{ width: 420 }}
                          />
                        </Form.Item>
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowUpOutlined />}
                          disabled={optionIndex === 0}
                          onClick={() => optionOps.move(optionIndex, optionIndex - 1)}
                          title="Move up"
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowDownOutlined />}
                          disabled={optionIndex === options.length - 1}
                          onClick={() => optionOps.move(optionIndex, optionIndex + 1)}
                          title="Move down"
                        />
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => optionOps.remove(option.name)}
                          title="Remove option"
                        />
                      </Space>
                    ))}
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      disabled={options.length >= MAX_OPTIONS}
                      onClick={() => optionOps.add({ text: '' })}
                    >
                      Add Option
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </div>
                )}
              </Form.List>
            </Card>
          ))}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            disabled={questions.length >= MAX_QUESTIONS}
            onClick={() => add(newQuestion())}
          >
            Add Question
          </Button>
        </div>
      )}
    </Form.List>
  );

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit Poll' : 'New Poll'}
      okText={isEdit ? 'Save' : 'Save Draft'}
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
      width={760}
    >
      <Form form={form} layout="vertical" style={{ width: '100%' }}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, whitespace: true, message: 'Enter a title' }]}
        >
          <Input maxLength={255} autoFocus />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} maxLength={10000} />
        </Form.Item>
        <Space size={24} align="start" wrap>
          <Form.Item
            name="closesAt"
            label="Voting ends"
            rules={[
              { required: true, message: 'Pick when voting ends' },
              {
                validator: (_, value?: Dayjs) =>
                  value && !value.isAfter(dayjs())
                    ? Promise.reject(new Error('Pick a time in the future'))
                    : Promise.resolve(),
              },
            ]}
          >
            <DatePicker
              showTime={{ format: Formats.TIME_FORMAT, use12Hours: true, minuteStep: 5 }}
              format={Formats.DATE_TIME_FORMAT}
              allowClear={false}
            />
          </Form.Item>
          <Form.Item
            name="anonymous"
            label="Anonymous"
            valuePropName="checked"
            tooltip="Results show counts only, never who voted for what. Can't change once the poll is open."
          >
            <Switch disabled={!isDraft} />
          </Form.Item>
          <Form.Item
            name="showResultsWhileOpen"
            label="Results while open"
            valuePropName="checked"
            tooltip="Let members see the results before voting ends."
          >
            <Switch />
          </Form.Item>
        </Space>
        {isDraft ? (
          <>
            <Form.Item
              label={
                <Space size={8}>
                  <span>Eligible voters</span>
                  <Button
                    type="link"
                    size="small"
                    onClick={() =>
                      form.setFieldsValue({
                        eligibleVoterIds: members.map(m => m.voterId),
                      })
                    }
                  >
                    All members
                  </Button>
                </Space>
              }
              name="eligibleVoterIds"
              extra="Leave empty to let every member vote."
            >
              <Select
                mode="multiple"
                allowClear
                optionFilterProp="label"
                placeholder="Every member"
                maxTagCount="responsive"
                options={members.map(member => ({
                  value: member.voterId,
                  label: member.name ?? member.voterId,
                }))}
              />
            </Form.Item>
            <Typography.Title level={5}>Questions</Typography.Title>
            {questionsEditor}
          </>
        ) : (
          <Alert
            type="info"
            showIcon
            message="The questions, anonymity and eligible voters can't change once the poll is open. Add voters from the Voters tab."
          />
        )}
      </Form>
    </Modal>
  );
};

export default PollFormModal;
