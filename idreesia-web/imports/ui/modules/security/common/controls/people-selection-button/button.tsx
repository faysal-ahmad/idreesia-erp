import React, { useState } from 'react';
import { Button } from 'antd';

import { PersonPickerDrawer, type PickerPerson } from '/imports/ui/modules/helpers/controls';

import { securityMehfilPeopleSource } from './paged-security-mehfil-people';

interface Props {
  icon?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  onSelection?(value: { _id: string }): void;
}

/**
 * A button that opens a person picker drawer of anyone who can be put on a
 * mehfil's duty; each person picked is passed to onSelection, and the drawer
 * stays open to pick more.
 */
const PeopleSelectionButton = ({
  icon,
  label = 'Select Karkuns',
  disabled = false,
  onSelection,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PersonPickerDrawer
        title="Select Karkuns"
        open={open}
        onClose={() => setOpen(false)}
        source={securityMehfilPeopleSource}
        showParentName={false}
        itemsLabel="people"
        onPick={(person: PickerPerson) => onSelection?.({ _id: person._id })}
      />
      <Button onClick={() => setOpen(true)} disabled={disabled} icon={icon}>
        {label}
      </Button>
    </>
  );
};

export default PeopleSelectionButton;
