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

const Picture = ({ loading, visitorId, securityVisitorById }) => {
  const [setSecurityVisitorImage] = useMutation(SET_SECURITY_VISITOR_IMAGE, {
    refetchQueries: ['pagedSecurityVisitors'],
  });

  const updateImageId = imageId => {
    setSecurityVisitorImage({
      variables: {
        _id: visitorId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  if (loading) return null;
  const url = getDownloadUrl(securityVisitorById.imageId);

  return (
    <Fragment>
      <Row>
        <Col span={16}>
          <img style={{ maxWidth: '400px' }} src={url} />
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

const PictureWithData = props => {
  const { match } = props;
  const { visitorId } = match.params;
  const { data = {}, loading, ...queryResult } = useQuery(SECURITY_VISITOR_BY_ID, {
    variables: { _id: visitorId },
  });

  return (
    <Picture
      {...props}
      {...queryResult}
      {...data}
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
