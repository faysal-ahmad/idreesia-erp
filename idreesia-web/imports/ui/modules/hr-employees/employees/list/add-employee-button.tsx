import React, { useState } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { PersonPickerDrawer, type PickerPerson } from '/imports/ui/modules/helpers/controls';

import { hrEmployeeCandidateSource } from '../gql';
import StartEmploymentModal from '../lifecycle/start-employment-modal';

/**
 * Picks a Multan karkun who isn't an employee, then hires them (or rejoins
 * them, if they were employed before).
 */
const AddEmployeeButton = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [picked, setPicked] = useState<PickerPerson | null>(null);

  const handlePick = (person: PickerPerson) => {
    setShowDrawer(false);
    setPicked(person);
  };

  return (
    <>
      <PersonPickerDrawer
        title="Add Employee"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        source={hrEmployeeCandidateSource}
        mode="single"
        addLabel="Select"
        onPick={handlePick}
      />
      <StartEmploymentModal
        personId={picked?._id ?? null}
        personName={picked?.name}
        onClose={() => setPicked(null)}
      />
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => setShowDrawer(true)}
      >
        Add Employee
      </Button>
    </>
  );
};

export default AddEmployeeButton;
