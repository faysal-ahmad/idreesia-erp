import React, { useState } from 'react';
import { Alert, Button, Input, Upload } from 'antd';
import { PaperClipOutlined, SendOutlined } from '@ant-design/icons';

import {
  MAX_DISCUSSION_FILE_SIZE,
  MAX_DISCUSSION_MESSAGE_LENGTH,
} from './types';

interface Props {
  canPost: boolean;
  onSend: (text: string) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
}

const Composer = ({ canPost, onSend, onUpload }: Props) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canPost) {
    return (
      <div className="discussion-composer">
        <Alert
          type="info"
          showIcon
          message="You can read this discussion, but you need a chat account to post. Ask an administrator to create one for you."
        />
      </div>
    );
  }

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSend(trimmed);
      setText('');
    } catch (sendError) {
      setError(`Could not send the message: ${(sendError as Error).message}`);
    } finally {
      setSending(false);
    }
  };

  const handleUpload = (file: File) => {
    if (file.size > MAX_DISCUSSION_FILE_SIZE) {
      setError(`${file.name} is too large. Files can be at most 25 MB.`);
      return false;
    }
    setUploading(true);
    setError(null);
    onUpload(file)
      .catch((uploadError: Error) => {
        setError(`Could not upload ${file.name}: ${uploadError.message}`);
      })
      .finally(() => {
        setUploading(false);
      });
    // Uploading is handled here, not by antd.
    return false;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter adds a new line.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="discussion-composer">
      {error ? (
        <Alert
          className="discussion-composer-error"
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError(null)}
        />
      ) : null}
      <div className="discussion-composer-row">
        <Upload beforeUpload={handleUpload} showUploadList={false} multiple={false}>
          <Button
            icon={<PaperClipOutlined />}
            loading={uploading}
            title="Attach a file (up to 25 MB)"
          />
        </Upload>
        <Input.TextArea
          value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
          autoSize={{ minRows: 1, maxRows: 8 }}
          maxLength={MAX_DISCUSSION_MESSAGE_LENGTH}
          disabled={sending}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!text.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default Composer;
