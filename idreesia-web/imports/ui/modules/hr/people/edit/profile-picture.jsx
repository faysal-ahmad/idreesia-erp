import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from 'antd';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_PROFILE_IMAGE } from '../gql';

class ProfilePicture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    hrKarkunById: PropTypes.object,
    setHrKarkunProfileImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { karkunId, setHrKarkunProfileImage } = this.props;
    setHrKarkunProfileImage({
      variables: {
        _id: karkunId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, hrKarkunById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(hrKarkunById.imageId);

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
  graphql(SET_HR_KARKUN_PROFILE_IMAGE, {
    name: 'setHrKarkunProfileImage',
    options: {
      refetchQueries: ['pagedHrKarkuns'],
    },
  }),
  graphql(HR_KARKUN_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(ProfilePicture);
