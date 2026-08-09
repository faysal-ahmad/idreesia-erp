import React from 'react';
import { useMutation } from '@apollo/client/react';
import { Space } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
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

  const url = getDownloadUrl(securityVisitorById.imageId);

  return (
    <div className="security-visitor-picture">
      <div className="security-visitor-picture-preview">
        {url ? (
          <img
            src={url}
            alt={securityVisitorById.name ?? 'Visitor'}
          />
        ) : (
          <div className="security-visitor-picture-empty">
            <UserOutlined />
            <span>No picture uploaded</span>
          </div>
        )}
      </div>
      <Space size={12} wrap className="security-visitor-picture-actions">
        <UploadAttachment
          buttonText="Upload"
          onUploadFinish={updateImageId}
        />
        <TakePicture onPictureTaken={updateImageId} />
      </Space>
    </div>
  );
};

export default Picture;
