import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from '/imports/ui/controls';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import {
  PORTAL_KARKUN_BY_ID,
  PAGED_PORTAL_KARKUNS,
  SET_PORTAL_KARKUN_PROFILE_IMAGE,
} from '../gql';

class ProfilePicture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    portalId: PropTypes.string,
    karkunId: PropTypes.string,
    portalKarkunById: PropTypes.object,
    setPortalKarkunProfileImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { portalId, karkunId, setPortalKarkunProfileImage } = this.props;
    setPortalKarkunProfileImage({
      variables: {
        portalId,
        _id: karkunId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, portalKarkunById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(portalKarkunById.imageId);

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
            <UploadAttachment onUploadFinish={this.updateImageId} />
            <TakePicture onPictureTaken={this.updateImageId} />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default flowRight(
  graphql(SET_PORTAL_KARKUN_PROFILE_IMAGE, {
    name: 'setPortalKarkunProfileImage',
    options: {
      refetchQueries: [{ query: PAGED_PORTAL_KARKUNS }],
    },
  }),
  graphql(PORTAL_KARKUN_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ portalId, karkunId }) => ({
      variables: { portalId, _id: karkunId },
    }),
  })
)(ProfilePicture);
