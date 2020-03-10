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
  TELEPHONE_ROOM_VISITOR_BY_ID,
  SET_TELEPHONE_ROOM_VISITOR_IMAGE,
} from '../gql';

class Picture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    visitorId: PropTypes.string,
    telephoneRoomVisitorById: PropTypes.object,
    setTelephoneRoomVisitorImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { visitorId, setTelephoneRoomVisitorImage } = this.props;
    setTelephoneRoomVisitorImage({
      variables: {
        _id: visitorId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, telephoneRoomVisitorById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(telephoneRoomVisitorById.imageId);

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
  graphql(SET_TELEPHONE_ROOM_VISITOR_IMAGE, {
    name: 'setTelephoneRoomVisitorImage',
    options: {
      refetchQueries: ['pagedTelephoneRoomVisitors'],
    },
  }),
  graphql(TELEPHONE_ROOM_VISITOR_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(Picture);
