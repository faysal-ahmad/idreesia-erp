import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from '/imports/ui/controls';
import { TakePicture } from '/imports/ui/modules/helpers/controls';

import {
  PORTAL_VISITOR_BY_ID,
  PAGED_PORTAL_VISITORS,
  SET_PORTAL_VISITOR_IMAGE,
} from '../gql';

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
            <TakePicture onPictureTaken={this.updateImageId} />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default flowRight(
  graphql(SET_PORTAL_VISITOR_IMAGE, {
    name: 'setPortalVisitorImage',
    options: {
      refetchQueries: [{ query: PAGED_PORTAL_VISITORS }],
    },
  }),
  graphql(PORTAL_VISITOR_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ portalId, visitorId }) => ({
      variables: { portalId, _id: visitorId },
    }),
  })
)(Picture);
