import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Row, Col, message } from '/imports/ui/controls';
import { TakePicture } from '/imports/ui/modules/helpers/controls';

import { OPERATIONS_VISITOR_BY_ID, SET_OPERATIONS_VISITOR_IMAGE } from '../gql';

class Picture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    visitorId: PropTypes.string,
    operationsVisitorById: PropTypes.object,
    setOperationsVisitorImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { visitorId, setOperationsVisitorImage } = this.props;
    setOperationsVisitorImage({
      variables: {
        _id: visitorId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, operationsVisitorById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(operationsVisitorById.imageId);

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
  graphql(SET_OPERATIONS_VISITOR_IMAGE, {
    name: 'setOperationsVisitorImage',
    options: {
      refetchQueries: ['pagedOperationsVisitors'],
    },
  }),
  graphql(OPERATIONS_VISITOR_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(Picture);
