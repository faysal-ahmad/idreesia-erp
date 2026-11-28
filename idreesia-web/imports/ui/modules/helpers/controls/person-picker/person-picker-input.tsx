import React, { useState, type ReactNode } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Input } from 'antd';

import PersonPickerDrawer, { type PersonPickerTab } from './person-picker-drawer';
import type { PersonSearchSource, PickedPerson, PickerPerson } from './types';

/** A stored value may still carry the name under sharedData (older forms). */
type PersonPickerValue = PickedPerson & { sharedData?: { name?: string | null } | null };

export interface PersonPickerInputProps {
  value?: PersonPickerValue | null;
  onChange?(person: PickedPerson): void;
  source: PersonSearchSource;
  drawerTitle?: ReactNode;
  tabs?: PersonPickerTab[];
  sourceLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  selectedLabel?: string;
  addLabel?: string;
}

/**
 * A form input holding one person ({ _id, name }). The edit button opens a
 * person picker drawer; picking someone closes it and sets the value.
 */
const PersonPickerInput = ({
  value,
  onChange,
  source,
  drawerTitle = 'Select a Karkun',
  tabs,
  sourceLabel,
  placeholder,
  disabled,
  selectedLabel = 'Selected',
  addLabel = 'Select',
}: PersonPickerInputProps) => {
  const [open, setOpen] = useState(false);

  const handlePick = (person: PickerPerson) => {
    onChange?.({ _id: person._id, name: person.name });
  };

  return (
    <>
      <PersonPickerDrawer
        open={open}
        title={drawerTitle}
        source={source}
        tabs={tabs}
        sourceLabel={sourceLabel}
        mode="single"
        selectedIds={value?._id ? [value._id] : []}
        selectedLabel={selectedLabel}
        addLabel={addLabel}
        onPick={handlePick}
        onClose={() => setOpen(false)}
      />
      <Input
        type="text"
        value={value?.name ?? value?.sharedData?.name ?? ''}
        readOnly
        addonAfter={
          <EditOutlined
            onClick={() => {
              if (!disabled) setOpen(true);
            }}
          />
        }
        placeholder={placeholder}
      />
    </>
  );
};

export default PersonPickerInput;
