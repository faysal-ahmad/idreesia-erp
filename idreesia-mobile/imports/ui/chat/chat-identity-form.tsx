import React, { useState } from 'react';
import { Button, Form, Input } from 'antd-mobile';

import { showError } from '../layout';
import { getOrCreateToken, saveIdentity, toE164, type ChatIdentity } from './chat-identity';
import { registerVisitor } from './chat-api';

interface Props {
  onDone: (identity: ChatIdentity) => void;
}

interface FormValues {
  name: string;
  mobileNumber: string;
}

/** Name and mobile number, asked once before the first message. */
export const ChatIdentityForm = ({ onDone }: Props) => {
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: FormValues) => {
    const name = values.name.trim();
    const mobileNumber = toE164(values.mobileNumber) as string;
    setSubmitting(true);
    try {
      await registerVisitor({ token: getOrCreateToken(), name, phone: mobileNumber });
      onDone(saveIdentity(name, mobileNumber));
    } catch (error) {
      showError(error, 'Could not start the chat.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="chat-intro">
        Send us a message and our team will reply here. Tell us who you are first.
      </p>
      <Form
        layout="vertical"
        mode="card"
        onFinish={handleFinish}
        footer={
          <Button block color="primary" loading={submitting} size="large" type="submit">
            Start chat
          </Button>
        }
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, whitespace: true, message: 'Please enter your name.' },
            { max: 100, message: 'Please use at most 100 characters.' },
          ]}
        >
          <Input autoComplete="name" autoCapitalize="words" clearable />
        </Form.Item>
        <Form.Item
          label="Mobile number"
          name="mobileNumber"
          help="For example 0300 1234567, or +44… for numbers outside Pakistan."
          rules={[
            { required: true, message: 'Please enter your mobile number.' },
            {
              validator: async (_rule, value: string) => {
                if (value && !toE164(value)) {
                  throw new Error('Please enter a valid mobile number, e.g. 0300 1234567.');
                }
              },
            },
          ]}
        >
          <Input type="tel" inputMode="tel" autoComplete="tel" clearable />
        </Form.Item>
      </Form>
    </>
  );
};
