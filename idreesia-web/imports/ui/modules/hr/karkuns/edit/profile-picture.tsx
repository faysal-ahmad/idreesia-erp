import React, { Fragment } from 'react';
import { type match } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from 'antd';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_PROFILE_IMAGE } from '../gql';

interface Props { match: match<{ karkunId: string }>; karkunId: string; }

const ProfilePicture = ({ karkunId, match }: Props) => {
  const { data, loading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: match.params.karkunId },
  });
  const [setHrKarkunProfileImage] = useMutation(SET_HR_KARKUN_PROFILE_IMAGE, {
    refetchQueries: ['pagedHrKarkuns'],
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

  if (loading) return null;
  const url = getDownloadUrl(data?.hrKarkunById?.imageId);

  return (
    <Fragment>
      <Row>
        <Col span={16}>
          {url ? <img style={{ maxWidth: '400px' }} src={url} alt="Profile" /> : null}
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

export default ProfilePicture;
