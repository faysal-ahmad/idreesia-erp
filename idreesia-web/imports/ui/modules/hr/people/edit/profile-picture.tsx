import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from 'antd';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_PROFILE_IMAGE } from '../gql';

const ReactFragment = Fragment as any;
const AntRow = Row as any;
const AntCol = Col as any;
const TakePictureControl = TakePicture as any;
const UploadAttachmentControl = UploadAttachment as any;
type AnyRecord = Record<string, any>;
interface MatchLike { params: { karkunId: string; }; }
interface QueryData { hrKarkunById?: AnyRecord | null; }
interface Props { match: MatchLike; karkunId?: string | null; }

const ProfilePicture = ({ match, karkunId }: Props) => {
  const { data, loading } = useQuery(HR_KARKUN_BY_ID as any, {
    variables: { _id: match.params.karkunId },
  });
  const [setHrKarkunProfileImage] = useMutation(SET_HR_KARKUN_PROFILE_IMAGE as any, {
    refetchQueries: ['pagedHrKarkuns'],
  });
  const { hrKarkunById } = (data ?? {}) as QueryData;

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
  const url = getDownloadUrl(hrKarkunById?.imageId);

  return (
    <ReactFragment>
      <AntRow>
        <AntCol span={16}>
          {url ? <img style={{ maxWidth: '400px' }} src={url} alt="Profile" /> : null}
        </AntCol>
      </AntRow>
      <br />
      <AntRow>
        <AntCol span={16}>
          <UploadAttachmentControl onUploadFinish={updateImageId} />
          <TakePictureControl onPictureTaken={updateImageId} />
        </AntCol>
      </AntRow>
    </ReactFragment>
  );
};

ProfilePicture.propTypes = {
  match: PropTypes.object,
  karkunId: PropTypes.string,
};

export default ProfilePicture;
