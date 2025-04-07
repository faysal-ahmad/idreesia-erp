import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, message } from 'antd';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import { SET_STOCK_ITEM_IMAGE } from '../gql';

class Picture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    stockItemById: PropTypes.object,
    setStockItemImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { stockItemById, setStockItemImage } = this.props;
    setStockItemImage({
      variables: {
        _id: stockItemById._id,
        physicalStoreId: stockItemById.physicalStoreId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { stockItemById } = this.props;
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

export default flowRight(
  graphql(SET_STOCK_ITEM_IMAGE, {
    name: 'setStockItemImage',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
)(Picture);
