import React, { useState } from 'react';
import { Button } from 'antd';

import { PersonPickerDrawer, type PickerPerson } from '/imports/ui/modules/helpers/controls';

import { securityEventPeopleSource } from './paged-security-event-people';

interface Props {
  icon?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  onSelection?(value: { _id: string }): void;
}

/**
 * A button that opens a person picker drawer of the karkuns (from any city)
 * who can be put on an event's duty; each person picked is passed to
 * onSelection, and the drawer stays open to pick more.
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
        source={securityEventPeopleSource}
        showParentName={false}
        itemsLabel="karkuns"
        onPick={(person: PickerPerson) => onSelection?.({ _id: person._id })}
      />
      <Button onClick={() => setOpen(true)} disabled={disabled} icon={icon}>
        {label}
      </Button>
    </>
  );
};

export default PeopleSelectionButton;
