import React, { Fragment } from 'react';
import { useMutation } from '@apollo/client/react';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from 'antd';
import type { SecurityRegistrationVisitorByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

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
    refetchQueries: ['pagedSecurityVisitors'],
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

  const url = getDownloadUrl(securityVisitorById.imageId);

  return (
    <Fragment>
      <Row>
        <Col span={16}>
          <img
            style={{ maxWidth: '400px' }}
            src={url ?? undefined}
            alt={securityVisitorById.name ?? 'Visitor'}
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Col span={16}>
          <UploadAttachment onUploadFinish={updateImageId} />
          <TakePicture onPictureTaken={updateImageId} />
        </Col>
      </Row>
    </Fragment>
  );
};

export default Picture;
