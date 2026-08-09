import React from 'react';
import { useMutation } from '@apollo/client/react';
import { Space } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import type { HrKarkunByIdForKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

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

  const url = getDownloadUrl(karkun.imageId);

  return (
    <div className="security-visitor-picture">
      <div className="security-visitor-picture-preview">
        {url ? (
          <img src={url} alt={karkun.name ?? 'Karkun'} />
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
