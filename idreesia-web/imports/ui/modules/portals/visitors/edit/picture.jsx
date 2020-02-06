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

class Picture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    portalId: PropTypes.string,
    visitorId: PropTypes.string,
    portalVisitorById: PropTypes.object,
    setPortalVisitorImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { portalId, visitorId, setPortalVisitorImage } = this.props;
    setPortalVisitorImage({
      variables: {
        portalId,
        _id: visitorId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, portalVisitorById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(portalVisitorById.imageId);

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
  query portalVisitorById($portalId: String!, $_id: String!) {
    portalVisitorById(portalId: $portalId, _id: $_id) {
      _id
      imageId
    }
  }
`;

const formMutation = gql`
  mutation setPortalVisitorImage($_id: String!, $imageId: String!) {
    setPortalVisitorImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setPortalVisitorImage',
    options: {
      refetchQueries: ['pagedPortalVisitors'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ portalId, visitorId }) => ({
      variables: { portalId, _id: visitorId },
    }),
  })
)(Picture);
