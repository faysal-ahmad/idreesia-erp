import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Popup, Selector, Stepper, Switch, TextArea, Toast } from 'antd-mobile';
import { AddCircleOutline, CloseCircleOutline } from 'antd-mobile-icons';

/** A question being edited on the poll form (not saved until the poll is). */
export interface QuestionDraft {
  key: string;
  /** Set for a saved question, so its id (and votes' links) are kept. */
  _id?: string | null;
  text: string;
  description?: string | null;
  type: 'single' | 'multiple';
  required: boolean;
  minChoices?: number | null;
  maxChoices?: number | null;
  options: Array<{ key: string; _id?: string | null; text: string }>;
}

interface FormValues {
  text: string;
  description?: string;
  type: Array<'single' | 'multiple'>;
  required: boolean;
  minChoices?: number | null;
  maxChoices?: number | null;
}

let keySeed = 0;
export const newKey = () => {
  keySeed += 1;
  return `new-${keySeed}`;
};

const MAX_OPTIONS = 50;

interface Props {
  /** The question to edit, or 'new'; null closes the sheet. */
  question: QuestionDraft | 'new' | null;
  onClose: () => void;
  onSave: (question: QuestionDraft) => void;
}

/** A bottom sheet for one question: its text, type, choices and options. */
export const QuestionEditorPopup = ({ question, onClose, onSave }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [options, setOptions] = useState<QuestionDraft['options']>([]);
  const isNew = question === 'new';

  useEffect(() => {
    if (!question) return;
    form.resetFields();
    if (question === 'new') {
      form.setFieldsValue({ type: ['single'], required: true, minChoices: null, maxChoices: null });
      setOptions([
        { key: newKey(), text: '' },
        { key: newKey(), text: '' },
      ]);
    } else {
      form.setFieldsValue({
        text: question.text,
        description: question.description ?? '',
        type: [question.type],
        required: question.required,
        minChoices: question.minChoices ?? null,
        maxChoices: question.maxChoices ?? null,
      });
      setOptions(question.options.map(option => ({ ...option })));
    }
  }, [question, form]);

  const save = (values: FormValues) => {
    const filled = options
      .map(option => ({ ...option, text: option.text.trim().replace(/\s+/g, ' ') }))
      .filter(option => option.text);
    if (filled.length < 2) {
      Toast.show({ content: 'Please add at least 2 options.' });
      return;
    }
    const texts = filled.map(option => option.text.toLowerCase());
    if (new Set(texts).size !== texts.length) {
      Toast.show({ content: 'Each option must be different.' });
      return;
    }
    const type = values.type?.[0] ?? 'single';
    const min = type === 'multiple' ? values.minChoices || null : null;
    const max = type === 'multiple' ? values.maxChoices || null : null;
    if (max && max > filled.length) {
      Toast.show({ content: "Choose at most can't be more than the number of options." });
      return;
    }
    if (min && min > (max ?? filled.length)) {
      Toast.show({ content: "Choose at least can't be more than choose at most." });
      return;
    }
    onSave({
      key: question && question !== 'new' ? question.key : newKey(),
      _id: question && question !== 'new' ? question._id : null,
      text: values.text.trim(),
      description: values.description?.trim() || null,
      type,
      required: values.required,
      minChoices: min,
      maxChoices: max,
      options: filled,
    });
  };

  return (
    <Popup bodyClassName="poll-form-popup" destroyOnClose position="bottom" visible={!!question} onMaskClick={onClose}>
      <Form
        form={form}
        layout="vertical"
        mode="card"
        onFinish={save}
        footer={
          <Button block color="primary" size="large" type="submit">
            {isNew ? 'Add question' : 'Save question'}
          </Button>
        }
      >
        <Form.Header>{isNew ? 'New question' : 'Edit question'}</Form.Header>
        <Form.Item
          label="Question"
          name="text"
          rules={[{ required: true, whitespace: true, message: 'Please enter the question.' }]}
        >
          <TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={1000} placeholder="Question" />
        </Form.Item>
        <Form.Item label="Details" name="description">
          <TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={10000} placeholder="Details (optional)" />
        </Form.Item>
        <Form.Item label="Answer" name="type" rules={[{ required: true, message: 'Please choose.' }]}>
          <Selector
            columns={2}
            options={[
              { value: 'single', label: 'One choice' },
              { value: 'multiple', label: 'Multiple choices' },
            ]}
          />
        </Form.Item>
        <Form.Item childElementPosition="right" label="Required" layout="horizontal" name="required" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Subscribe to={['type']}>
          {({ type }) =>
            type?.[0] === 'multiple' ? (
              <>
                <Form.Item childElementPosition="right" description="Leave empty for 1." label="Choose at least" layout="horizontal" name="minChoices">
                  <Stepper allowEmpty digits={0} max={MAX_OPTIONS} min={1} />
                </Form.Item>
                <Form.Item
                  childElementPosition="right"
                  description="Leave empty for any number."
                  label="Choose at most"
                  layout="horizontal"
                  name="maxChoices"
                >
                  <Stepper allowEmpty digits={0} max={MAX_OPTIONS} min={1} />
                </Form.Item>
              </>
            ) : null
          }
        </Form.Subscribe>
        <Form.Item label="Options">
          <div className="poll-options">
            {options.map((option, index) => (
              <div key={option.key} className="poll-option-row">
                <Input
                  autoCapitalize="sentences"
                  maxLength={255}
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={text =>
                    setOptions(current => current.map(item => (item.key === option.key ? { ...item, text } : item)))
                  }
                />
                <CloseCircleOutline
                  aria-label="Remove option"
                  className="poll-option-remove"
                  onClick={() => setOptions(current => current.filter(item => item.key !== option.key))}
                />
              </div>
            ))}
            {options.length < MAX_OPTIONS && (
              <Button
                fill="none"
                size="small"
                onClick={() => setOptions(current => [...current, { key: newKey(), text: '' }])}
              >
                <AddCircleOutline /> Add option
              </Button>
            )}
          </div>
        </Form.Item>
      </Form>
    </Popup>
  );
};
