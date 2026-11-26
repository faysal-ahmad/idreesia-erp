import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { PersonPickerDrawer, type PickerPerson } from '/imports/ui/modules/helpers/controls';

import { SET_HR_KARKUN_EMPLOYMENT_INFO, hrEmployeeCandidateSource } from '../gql';

const AddEmployeeButton = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [setHrKarkunEmploymentInfo] = useMutation(
    SET_HR_KARKUN_EMPLOYMENT_INFO,
    {
      refetchQueries: ['hrPeoplePagedHrKarkuns'],
    }
  );

  const handlePick = (person: PickerPerson) => {
    setHrKarkunEmploymentInfo({
      variables: {
        _id: person._id,
        isEmployee: true,
        employmentStartDate: new Date().toISOString(),
        employmentEndDate: null,
        jobId: null,
      },
    })
      .then(() => {
        message.success('Employee added', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
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
