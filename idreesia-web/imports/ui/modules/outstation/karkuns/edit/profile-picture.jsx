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
    outstationKarkunById: PropTypes.object,
    setOutstationKarkunProfileImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { karkunId, setOutstationKarkunProfileImage } = this.props;
    setOutstationKarkunProfileImage({
      variables: {
        _id: karkunId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, outstationKarkunById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(outstationKarkunById.imageId);

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
  query outstationKarkunById($_id: String!) {
    outstationKarkunById(_id: $_id) {
      _id
      imageId
    }
  }
`;

const formMutation = gql`
  mutation setOutstationKarkunProfileImage($_id: String!, $imageId: String!) {
    setOutstationKarkunProfileImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setOutstationKarkunProfileImage',
    options: {
      refetchQueries: ['pagedOutstationKarkuns'],
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
