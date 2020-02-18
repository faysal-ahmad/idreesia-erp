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

import { KARKUN_BY_ID, SET_KARKUN_PROFILE_IMAGE } from '../gql';

class ProfilePicture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    setKarkunProfileImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { karkunId, setKarkunProfileImage } = this.props;
    setKarkunProfileImage({
      variables: {
        _id: karkunId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, karkunById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(karkunById.imageId);

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
  graphql(SET_KARKUN_PROFILE_IMAGE, {
    name: 'setKarkunProfileImage',
    options: {
      refetchQueries: ['pagedKarkuns'],
    },
  }),
  graphql(KARKUN_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(ProfilePicture);
