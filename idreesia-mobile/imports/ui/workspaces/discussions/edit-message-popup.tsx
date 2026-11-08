import React, { useEffect, useState } from 'react';
import { Button, Popup, TextArea, Toast } from 'antd-mobile';

import { getErrorMessage } from '../../auth/accounts';

interface Props {
  /** The text being edited; null hides the popup. */
  initialText: string | null;
  onSave: (text: string) => Promise<void>;
  onClose: () => void;
}

/** Edits one of the user's own messages. */
export const EditMessagePopup = ({ initialText, onSave, onClose }: Props) => {
  const [text, setText] = useState(initialText ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(initialText ?? '');
  }, [initialText]);

  const trimmed = text.trim();
  const handleSave = async () => {
    if (!trimmed || saving) return;
    if (trimmed === (initialText ?? '').trim()) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } catch (error) {
      Toast.show({ icon: 'fail', content: getErrorMessage(error, 'Could not save the message.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popup bodyClassName="discussion-edit-popup" visible={initialText !== null} onMaskClick={onClose}>
      <div className="discussion-edit-title">Edit message</div>
      <TextArea
        autoFocus
        autoSize={{ minRows: 2, maxRows: 8 }}
        className="discussion-edit-input"
        maxLength={5000}
        value={text}
        onChange={setText}
      />
      <div className="discussion-edit-actions">
        <Button block fill="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button block color="primary" disabled={!trimmed} loading={saving} onClick={handleSave}>
          Save changes
        </Button>
      </div>
    </Popup>
  );
};
