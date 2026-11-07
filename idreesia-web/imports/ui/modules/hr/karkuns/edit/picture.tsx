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
    refetchQueries: ['hrKarkunsPagedHrKarkuns', 'hrKarkunByIdForKarkuns'],
  });

  const updateImage = (imageData: string) => {
    setHrKarkunProfileImage({
      variables: {
        _id: karkunId,
        imageData,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  return (
    <PersonPicture
      imageUrl={karkun.sharedData?.imageUrl}
      personName={karkun.sharedData?.name ?? undefined}
      onImageSelected={updateImage}
    />
  );
};

export default Picture;
