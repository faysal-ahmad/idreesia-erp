import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from '/imports/ui/controls';
import { TakePicture } from '/imports/ui/modules/helpers/controls';

import {
  PORTAL_MEMBER_BY_ID,
  PAGED_PORTAL_MEMBERS,
  SET_PORTAL_MEMBER_IMAGE,
} from '../gql';

class Picture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    portalId: PropTypes.string,
    memberId: PropTypes.string,
    portalMemberById: PropTypes.object,
    setPortalMemberImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { portalId, memberId, setPortalMemberImage } = this.props;
    setPortalMemberImage({
      variables: {
        portalId,
        _id: memberId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, portalMemberById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(portalMemberById.imageId);

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
  graphql(SET_PORTAL_MEMBER_IMAGE, {
    name: 'setPortalMemberImage',
    options: {
      refetchQueries: [{ query: PAGED_PORTAL_MEMBERS }],
    },
  }),
  graphql(PORTAL_MEMBER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ portalId, memberId }) => ({
      variables: { portalId, _id: memberId },
    }),
  })
)(Picture);
