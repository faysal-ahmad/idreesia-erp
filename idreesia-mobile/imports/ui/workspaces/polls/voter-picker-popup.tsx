import React, { useEffect, useRef, useState } from 'react';
import { Button, CheckList, Popup, SearchBar, Space } from 'antd-mobile';

import type { Member } from './use-poll';

interface Props {
  visible: boolean;
  title: string;
  members: Member[];
  selectedIds: string[];
  /** Members who can't be unselected (e.g. already eligible on an open poll). */
  lockedIds?: string[];
  /** What the confirm button says, e.g. "Add voters". */
  confirmText: string;
  confirmLoading?: boolean;
  note?: string;
  onClose: () => void;
  onConfirm: (voterIds: string[]) => void;
}

/** A bottom sheet for choosing committee members, with search and all / none. */
export const VoterPickerPopup = ({
  visible,
  title,
  members,
  selectedIds,
  lockedIds = [],
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

  const locked = new Set(lockedIds);
  const text = search.trim().toLowerCase();
  const shown = text
    ? members.filter(member => (member.name ?? '').toLowerCase().includes(text))
    : members;

  return (
    <Popup bodyClassName="poll-picker" destroyOnClose position="bottom" visible={visible} onMaskClick={onClose}>
      <div className="poll-picker-header">
        <span className="poll-picker-title">{title}</span>
        <Space>
          <Button fill="none" size="small" onClick={() => setSelected(members.map(m => m.voterId))}>
            All
          </Button>
          <Button fill="none" size="small" onClick={() => setSelected([...locked])}>
            None
          </Button>
        </Space>
      </div>
      <div className="poll-picker-search">
        <SearchBar clearable placeholder="Name" value={search} onChange={setSearch} />
      </div>
      <div className="poll-picker-list">
        <CheckList
          multiple
          value={selected}
          onChange={values => setSelected([...new Set([...(values as string[]), ...locked])])}
        >
          {shown.map(member => (
            <CheckList.Item key={member.voterId} disabled={locked.has(member.voterId)} value={member.voterId}>
              {member.name ?? member.voterId}
            </CheckList.Item>
          ))}
        </CheckList>
      </div>
      <div className="poll-picker-footer">
        {note && <p className="poll-picker-note">{note}</p>}
        <Button block color="primary" loading={confirmLoading} size="large" onClick={() => onConfirm(selected)}>
          {confirmText} ({selected.length})
        </Button>
      </div>
    </Popup>
  );
};
