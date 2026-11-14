import React, { useEffect, useRef, useState } from 'react';
import { Button, CheckList, Popup, SearchBar, Space } from 'antd-mobile';

import type { Member } from './use-projects';

interface Props {
  visible: boolean;
  title: string;
  members: Member[];
  /** Choose several (with all / none) or just one. */
  multiple?: boolean;
  selectedIds: string[];
  /** Members who can't be unselected (e.g. existing participants). */
  lockedIds?: string[];
  /** One-choice pickers can offer "No one" (e.g. an unassigned task). */
  allowNone?: boolean;
  confirmText: string;
  confirmLoading?: boolean;
  note?: string;
  onClose: () => void;
  onConfirm: (personIds: string[]) => void;
}

/** A bottom sheet for choosing committee members, with search. */
export const MemberPickerPopup = ({
  visible,
  title,
  members,
  multiple = false,
  selectedIds,
  lockedIds = [],
  allowNone = false,
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
  const shown = text ? members.filter(member => (member.name ?? '').toLowerCase().includes(text)) : members;

  return (
    <Popup bodyClassName="project-picker" destroyOnClose position="bottom" visible={visible} onMaskClick={onClose}>
      <div className="project-picker-header">
        <span className="project-picker-title">{title}</span>
        {multiple ? (
          <Space>
            <Button fill="none" size="small" onClick={() => setSelected(members.map(m => m.personId))}>
              All
            </Button>
            <Button fill="none" size="small" onClick={() => setSelected([...locked])}>
              None
            </Button>
          </Space>
        ) : (
          allowNone && (
            <Button fill="none" size="small" onClick={() => setSelected([])}>
              No one
            </Button>
          )
        )}
      </div>
      <div className="project-picker-search">
        <SearchBar clearable placeholder="Name" value={search} onChange={setSearch} />
      </div>
      <div className="project-picker-list">
        <CheckList
          multiple={multiple}
          value={selected}
          onChange={values => setSelected([...new Set([...(values as string[]), ...locked])])}
        >
          {shown.map(member => (
            <CheckList.Item key={member.personId} disabled={locked.has(member.personId)} value={member.personId}>
              {member.name ?? member.personId}
            </CheckList.Item>
          ))}
        </CheckList>
      </div>
      <div className="project-picker-footer">
        {note && <p className="project-picker-note">{note}</p>}
        <Button
          block
          color="primary"
          disabled={!multiple && !allowNone && selected.length === 0}
          loading={confirmLoading}
          size="large"
          onClick={() => onConfirm(selected)}
        >
          {confirmText}
          {multiple ? ` (${selected.length})` : ''}
        </Button>
      </div>
    </Popup>
  );
};
