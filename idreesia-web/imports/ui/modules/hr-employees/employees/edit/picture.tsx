import React from 'react';
import { useMutation } from '@apollo/client/react';
import { message } from '/imports/ui/antd-feedback';

import type { HrEmployeeByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonPicture } from '/imports/ui/modules/common';

import { SET_HR_EMPLOYEE_PROFILE_IMAGE } from '../gql';

type Employee = NonNullable<HrEmployeeByIdQuery['hrEmployeeById']>;

interface Props {
  employeeId: string;
  employee: Employee;
}

const Picture = ({ employeeId, employee }: Props) => {
  const [setHrEmployeeProfileImage] = useMutation(SET_HR_EMPLOYEE_PROFILE_IMAGE, {
    refetchQueries: ['pagedHrEmployees', 'hrEmployeeById'],
  });

  const updateImage = (imageData: string) => {
    setHrEmployeeProfileImage({
      variables: {
        _id: employeeId,
        imageData,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  return (
    <PersonPicture
      imageUrl={employee.sharedData?.imageUrl}
      personName={employee.sharedData?.name ?? undefined}
      onImageSelected={updateImage}
    />
  );
};

export default Picture;
