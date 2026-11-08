import React, { useEffect, useRef, useState } from 'react';
import { Button, CheckList, Popup, SearchBar, Space } from 'antd-mobile';

import type { Member } from './use-meeting';

interface Props {
  visible: boolean;
  title: string;
  members: Array<Member & { participantId: string }>;
  selectedIds: string[];
  /** What the confirm button says, e.g. "Save participants". */
  confirmText: string;
  confirmLoading?: boolean;
  note?: string;
  onClose: () => void;
  onConfirm: (participantIds: string[]) => void;
}

/** A bottom sheet for choosing committee members, with search and all / none. */
export const MemberPickerPopup = ({
  visible,
  title,
  members,
  selectedIds,
  confirmText,
  confirmLoading,
  note,
  onClose,
  onConfirm,
}: Props) => {
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [search, setSearch] = useState('');

  // Start from the current selection each time it opens (only then, as
  // callers may pass a new array on every render).
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) {
      setSelected(selectedIds);
      setSearch('');
    }
    wasVisible.current = visible;
  }, [visible, selectedIds]);

  const text = search.trim().toLowerCase();
  const shown = text
    ? members.filter(member => (member.name ?? '').toLowerCase().includes(text))
    : members;

  return (
    <Popup
      bodyClassName="meeting-picker"
      destroyOnClose
      position="bottom"
      visible={visible}
      onMaskClick={onClose}
    >
      <div className="meeting-picker-header">
        <span className="meeting-picker-title">{title}</span>
        <Space>
          <Button fill="none" size="small" onClick={() => setSelected(members.map(m => m.participantId))}>
            All
          </Button>
          <Button fill="none" size="small" onClick={() => setSelected([])}>
            None
          </Button>
        </Space>
      </div>
      <div className="meeting-picker-search">
        <SearchBar clearable placeholder="Name" value={search} onChange={setSearch} />
      </div>
      <div className="meeting-picker-list">
        <CheckList multiple value={selected} onChange={values => setSelected(values as string[])}>
          {shown.map(member => (
            <CheckList.Item key={member.participantId} value={member.participantId}>
              {member.name ?? member.participantId}
            </CheckList.Item>
          ))}
        </CheckList>
      </div>
      <div className="meeting-picker-footer">
        {note && <p className="meeting-picker-note">{note}</p>}
        <Button
          block
          color="primary"
          loading={confirmLoading}
          size="large"
          onClick={() => onConfirm(selected)}
        >
          {confirmText} ({selected.length})
        </Button>
      </div>
    </Popup>
  );
};
