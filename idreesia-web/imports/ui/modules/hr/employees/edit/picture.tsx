import React from 'react';
import { useMutation } from '@apollo/client/react';
import { Space } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { UserOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import type { HrKarkunByIdForPeopleQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

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

  const url = getDownloadUrl(employee.imageId);

  return (
    <div className="security-visitor-picture">
      <div className="security-visitor-picture-preview">
        {url ? (
          <img src={url} alt={employee.name ?? 'Employee'} />
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
