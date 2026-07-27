import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Row, Col, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import { SET_STOCK_ITEM_IMAGE } from '../gql';

const ReactFragment = Fragment as any;
const AntRow = Row as any;
const AntCol = Col as any;
const UploadAttachmentComponent = UploadAttachment as any;
const TakePictureComponent = TakePicture as any;

interface StockItem {
  _id: string;
  physicalStoreId: string;
  imageId?: string;
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface PictureProps {
  loading?: boolean;
  stockItemById: StockItem;
  setStockItemImage: MutateFunction;
}

class Picture extends Component<PictureProps> {
  static propTypes = {
    loading: PropTypes.bool,
    stockItemById: PropTypes.object,
    setStockItemImage: PropTypes.func,
  };

  updateImageId = (imageId: string) => {
    const { stockItemById, setStockItemImage } = this.props;
    setStockItemImage({
      variables: {
        _id: stockItemById._id,
        physicalStoreId: stockItemById.physicalStoreId,
        imageId,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { stockItemById } = this.props;
    const url = getDownloadUrl(stockItemById.imageId);

    return (
      <ReactFragment>
        <AntRow>
          <AntCol span={16}>
            {url ? (
              <img style={{ maxWidth: '400px' }} src={url} alt="Stock item" />
            ) : null}
          </AntCol>
        </AntRow>
        <br />
        <AntRow>
          <AntCol span={16}>
            <UploadAttachmentComponent onUploadFinish={this.updateImageId} />
            <TakePictureComponent onPictureTaken={this.updateImageId} />
          </AntCol>
        </AntRow>
      </ReactFragment>
    );
  }
}

export default flowRight(
  withMutation(SET_STOCK_ITEM_IMAGE, {
    name: 'setStockItemImage',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  })
)(Picture as any);
