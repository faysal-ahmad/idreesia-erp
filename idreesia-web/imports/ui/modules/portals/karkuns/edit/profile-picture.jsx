import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from 'antd';
import { TakePicture } from '/imports/ui/modules/helpers/controls';

import {
  PAGED_PORTAL_KARKUNS,
  SET_PORTAL_KARKUN_PROFILE_IMAGE,
} from '../gql';

class ProfilePicture extends Component {
  static propTypes = {
    portalId: PropTypes.string,
    karkunId: PropTypes.string,
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
    const { portalKarkunById } = this.props;
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
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_KARKUNS, variables: { portalId, filter: {} } },
      ],
    }),
  })
)(ProfilePicture);
