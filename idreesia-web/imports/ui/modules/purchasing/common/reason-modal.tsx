import React, { useState } from 'react';
import { Input, Modal } from 'antd';

interface ReasonModalProps {
  open: boolean;
  title: string;
  okText?: string;
  // Called with the reason; the modal stays open while it runs.
  onOk: (reason: string) => Promise<unknown> | void;
  onCancel: () => void;
}

/** Asks why, for rejecting, cancelling or voiding something. */
const ReasonModal = ({ open, title, okText = 'Confirm', onOk, onCancel }: ReasonModalProps) => {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const handleOk = async () => {
    setBusy(true);
    try {
      await onOk(reason.trim());
      setReason('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      okText={okText}
      okButtonProps={{ disabled: reason.trim().length === 0 }}
      confirmLoading={busy}
      onOk={handleOk}
      onCancel={() => {
        setReason('');
        onCancel();
      }}
      destroyOnHidden
    >
      <Input.TextArea
        rows={3}
        autoFocus
        maxLength={1000}
        value={reason}
        placeholder="Reason"
        onChange={(event) => setReason(event.target.value)}
      />
    </Modal>
  );
};

export default ReasonModal;
