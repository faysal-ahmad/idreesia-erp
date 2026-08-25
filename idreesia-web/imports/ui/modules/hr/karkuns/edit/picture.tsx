import React from 'react';
import { useMutation } from '@apollo/client/react';
import { message } from '/imports/ui/antd-feedback';

import type { HrKarkunByIdForKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonPicture } from '/imports/ui/modules/common';

import { SET_HR_KARKUN_PROFILE_IMAGE } from '../gql';

type Karkun = NonNullable<HrKarkunByIdForKarkunsQuery['hrKarkunById']>;

interface Props {
  karkunId: string;
  karkun: Karkun;
}

const Picture = ({ karkunId, karkun }: Props) => {
  const [setHrKarkunProfileImage] = useMutation(SET_HR_KARKUN_PROFILE_IMAGE, {
    refetchQueries: ['pagedHrKarkuns', 'hrKarkunByIdForKarkuns'],
  });

  const updateImageId = (imageId: string) => {
    setHrKarkunProfileImage({
      variables: {
        _id: karkunId,
        imageId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  return (
    <PersonPicture
      imageId={karkun.sharedData?.imageId}
      personName={karkun.sharedData?.name ?? undefined}
      onUploadFinish={updateImageId}
      onPictureTaken={updateImageId}
    />
  );
};

export default Picture;
