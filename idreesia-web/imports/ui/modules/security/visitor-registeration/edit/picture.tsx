import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client/react';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from 'antd';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import { SECURITY_VISITOR_BY_ID, SET_SECURITY_VISITOR_IMAGE } from '../gql';

const ReactFragment = Fragment as any;
const AntRow = Row as any;
const AntCol = Col as any;
const TakePictureControl = TakePicture as any;
const UploadAttachmentControl = UploadAttachment as any;
interface VisitorRecord { imageId?: string; name?: string; }
interface PictureProps { loading?: boolean; visitorId: string; securityVisitorById?: VisitorRecord | null; }
interface PictureWithDataProps { match: { params: { visitorId: string } }; [key: string]: any; }
interface VisitorData { securityVisitorById?: VisitorRecord | null; }

const Picture = ({ loading, visitorId, securityVisitorById }: PictureProps) => {
  const [setSecurityVisitorImage] = useMutation(SET_SECURITY_VISITOR_IMAGE as any, {
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

  if (loading || !securityVisitorById) return null;
  const url = getDownloadUrl(securityVisitorById.imageId);

  return (
    <ReactFragment>
      <AntRow>
        <AntCol span={16}>
          <img style={{ maxWidth: '400px' }} src={url ?? undefined} alt={securityVisitorById.name ?? 'Visitor'} />
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

const PictureWithData = (props: PictureWithDataProps) => {
  const { match } = props;
  const { visitorId } = match.params;
  const { data = {}, loading, ...queryResult } = useQuery(SECURITY_VISITOR_BY_ID as any, {
    variables: { _id: visitorId },
  });

  return (
    <Picture
      {...props}
      {...queryResult}
      {...(data as VisitorData)}
      visitorId={visitorId}
      loading={loading}
    />
  );
};

Picture.propTypes = {
  loading: PropTypes.bool,
  visitorId: PropTypes.string,
  securityVisitorById: PropTypes.object,
};

export default PictureWithData;
