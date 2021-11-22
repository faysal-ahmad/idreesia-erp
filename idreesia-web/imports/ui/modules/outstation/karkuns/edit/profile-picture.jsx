import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from 'antd';
import { TakePicture } from '/imports/ui/modules/helpers/controls';

import {
  OUTSTATION_KARKUN_BY_ID,
  PAGED_OUTSTATION_KARKUNS,
  SET_OUTSTATION_KARKUN_PROFILE_IMAGE,
} from '../gql';

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
            <TakePicture onPictureTaken={this.updateImageId} />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default flowRight(
  graphql(SET_OUTSTATION_KARKUN_PROFILE_IMAGE, {
    name: 'setOutstationKarkunProfileImage',
    options: {
      refetchQueries: [{ query: PAGED_OUTSTATION_KARKUNS }],
    },
  }),
  graphql(OUTSTATION_KARKUN_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(ProfilePicture);
