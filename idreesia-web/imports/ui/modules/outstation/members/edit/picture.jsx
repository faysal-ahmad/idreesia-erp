import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from '/imports/ui/controls';
import { TakePicture } from '/imports/ui/modules/helpers/controls';

import {
  OUTSTATION_MEMBER_BY_ID,
  PAGED_OUTSTATION_MEMBERS,
  SET_OUTSTATION_MEMBER_IMAGE,
} from '../gql';

class Picture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    memberId: PropTypes.string,
    outstationMemberById: PropTypes.object,
    setOutstationMemberImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { memberId, setOutstationMemberImage } = this.props;
    setOutstationMemberImage({
      variables: {
        _id: memberId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, outstationMemberById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(outstationMemberById.imageId);

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
  graphql(SET_OUTSTATION_MEMBER_IMAGE, {
    name: 'setOutstationMemberImage',
    options: {
      refetchQueries: [{ query: PAGED_OUTSTATION_MEMBERS }],
    },
  }),
  graphql(OUTSTATION_MEMBER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ memberId }) => ({
      variables: { _id: memberId },
    }),
  })
)(Picture);
