import React, { useState } from 'react';
import { Button, Popup, TextArea } from 'antd-mobile';

import { showWarning } from '../../../layout';

interface Props {
  visible: boolean;
  title: string;
  placeholder: string;
  confirmText: string;
  onClose: () => void;
  /** Called with the reason; the popup closes when it resolves. */
  onConfirm: (reason: string) => Promise<unknown>;
}

/** Asks for the reason behind a reject / send-back, as a bottom sheet. */
export const ReasonPopup = ({ visible, title, placeholder, confirmText, onClose, onConfirm }: Props) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    if (!reason.trim()) {
      showWarning('Please enter a reason.');
      return;
    }
    setSaving(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popup destroyOnClose position="bottom" visible={visible} onClose={onClose} onMaskClick={onClose}>
      <div className="purchasing-filter-popup">
        <h3 className="purchasing-section-title">{title}</h3>
        <TextArea
          autoSize={{ minRows: 3, maxRows: 6 }}
          maxLength={500}
          placeholder={placeholder}
          value={reason}
          onChange={setReason}
        />
        <Button block color="danger" loading={saving} onClick={confirm}>
          {confirmText}
        </Button>
        <Button block fill="none" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Popup>
  );
};
