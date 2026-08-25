import React from 'react';
import { useMutation } from '@apollo/client/react';
import { message } from '/imports/ui/antd-feedback';

import type { SecurityRegistrationPersonByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonPicture } from '/imports/ui/modules/common';

import { SET_SECURITY_PERSON_IMAGE } from '../gql';

type SecurityVisitor = NonNullable<
  SecurityRegistrationPersonByIdQuery['securityPersonById']
>;

interface Props {
  visitorId: string;
  securityVisitorById: SecurityVisitor;
}

const Picture = ({ visitorId, securityVisitorById }: Props) => {
  const [setSecurityPersonImage] = useMutation(SET_SECURITY_PERSON_IMAGE, {
    refetchQueries: ['pagedSecurityPeople', 'securityRegistrationPersonById'],
  });

  const updateImageId = (imageId: string) => {
    setSecurityPersonImage({
      variables: {
        _id: visitorId,
        imageId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  return (
    <PersonPicture
      imageId={securityVisitorById.sharedData?.imageId}
      personName={securityVisitorById.sharedData?.name ?? undefined}
      onUploadFinish={updateImageId}
      onPictureTaken={updateImageId}
    />
  );
};

export default Picture;
