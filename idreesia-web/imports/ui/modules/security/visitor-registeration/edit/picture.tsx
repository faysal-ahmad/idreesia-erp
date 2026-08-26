import React from 'react';
import { useMutation } from '@apollo/client/react';
import { message } from '/imports/ui/antd-feedback';

import type { SecurityRegistrationVisitorByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonPicture } from '/imports/ui/modules/common';

import { SET_SECURITY_VISITOR_IMAGE } from '../gql';

type SecurityVisitor = NonNullable<
  SecurityRegistrationVisitorByIdQuery['securityVisitorById']
>;

interface Props {
  visitorId: string;
  securityVisitorById: SecurityVisitor;
}

const Picture = ({ visitorId, securityVisitorById }: Props) => {
  const [setSecurityVisitorImage] = useMutation(SET_SECURITY_VISITOR_IMAGE, {
    refetchQueries: ['pagedSecurityVisitors', 'securityRegistrationVisitorById'],
  });

  const updateImageId = (imageId: string) => {
    setSecurityVisitorImage({
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
