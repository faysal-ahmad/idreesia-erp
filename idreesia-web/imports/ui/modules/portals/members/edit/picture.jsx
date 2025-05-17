import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from 'antd';
import { TakePicture } from '/imports/ui/modules/helpers/controls';

import {
  PAGED_PORTAL_MEMBERS,
  SET_PORTAL_MEMBER_IMAGE,
} from '../gql';

class Picture extends Component {
  static propTypes = {
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
    const { portalMemberById } = this.props;
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
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_MEMBERS, variables: { portalId } },
      ],
    }),
  })
)(Picture);
