import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from '/imports/ui/controls';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

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

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      imageId
    }
  }
`;

const formMutation = gql`
  mutation setKarkunProfileImage($_id: String!, $imageId: String!) {
    setKarkunProfileImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setKarkunProfileImage',
    options: {
      refetchQueries: ['pagedKarkuns'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(ProfilePicture);
