import React, { useState } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client/react';

import { message as feedback } from '/imports/ui/antd-feedback';
import { SEND_INBOX_MESSAGE } from './gql';

interface Props {
  roomId: string;
  disabled?: boolean;
  onSent: () => void;
}

const ReplyBox = ({ roomId, disabled, onSent }: Props) => {
  const [text, setText] = useState('');
  const [sendInboxMessage, { loading }] = useMutation(SEND_INBOX_MESSAGE);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    try {
      await sendInboxMessage({ variables: { roomId, text: trimmed } });
      setText('');
      onSent();
    } catch (error) {
      feedback.error((error as Error).message, 5);
    }
  };

  return (
    <div className="inbox-reply-box">
      <Input.TextArea
        value={text}
        onChange={event => setText(event.target.value)}
        placeholder={
          disabled ? 'This conversation has been closed.' : 'Type a reply…'
        }
        autoSize={{ minRows: 3, maxRows: 10 }}
        disabled={disabled || loading}
        maxLength={5000}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        loading={loading}
        disabled={disabled || !text.trim()}
      >
        Send
      </Button>
    </div>
  );
};

export default ReplyBox;
