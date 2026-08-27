import React from 'react';
import { useMutation } from '@apollo/client/react';
import { message } from '/imports/ui/antd-feedback';

import type { HrKarkunByIdForPeopleQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonPicture } from '/imports/ui/modules/common';

import { SET_HR_KARKUN_PROFILE_IMAGE } from '../gql';

type Employee = NonNullable<HrKarkunByIdForPeopleQuery['hrKarkunById']>;

interface Props {
  employeeId: string;
  employee: Employee;
}

const Picture = ({ employeeId, employee }: Props) => {
  const [setHrKarkunProfileImage] = useMutation(SET_HR_KARKUN_PROFILE_IMAGE, {
    refetchQueries: ['pagedHrKarkuns', 'hrKarkunByIdForPeople'],
  });

  const updateImageId = (imageId: string) => {
    setHrKarkunProfileImage({
      variables: {
        _id: employeeId,
        imageId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  return (
    <PersonPicture
      imageId={employee.sharedData?.imageId}
      personName={employee.sharedData?.name ?? undefined}
      onUploadFinish={updateImageId}
      onPictureTaken={updateImageId}
    />
  );
};

export default Picture;
