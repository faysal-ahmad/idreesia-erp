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
    stockItemId: PropTypes.string,
    stockItemById: PropTypes.object,
    setStockItemImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { stockItemId, setStockItemImage } = this.props;
    setStockItemImage({
      variables: {
        _id: stockItemId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, stockItemById } = this.props;
    if (loading) return null;
    const url = getDownloadUrl(stockItemById.imageId);

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
  query stockItemById($_id: String!) {
    stockItemById(_id: $_id) {
      _id
      imageId
    }
  }
`;

const formMutation = gql`
  mutation setStockItemImage($_id: String!, $imageId: String!) {
    setStockItemImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'setStockItemImage',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ stockItemId }) => ({ variables: { _id: stockItemId } }),
  })
)(Picture);
