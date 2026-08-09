import React, { Fragment, type CSSProperties } from 'react';
import { useMutation } from '@apollo/client/react';
import { Row, Col } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import type { StockItemByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  TakePicture,
  UploadAttachment,
} from '/imports/ui/modules/helpers/controls';

import { SET_STOCK_ITEM_IMAGE } from '../gql';

type StockItem = NonNullable<StockItemByIdQuery['stockItemById']>;

interface Props {
  stockItemById: StockItem;
}

const Picture = ({ stockItemById }: Props) => {
  const [setStockItemImage] = useMutation(SET_STOCK_ITEM_IMAGE, {
    refetchQueries: ['pagedStockItems'],
  });

  const updateImageId = (imageId: string) => {
    if (!stockItemById._id || !stockItemById.physicalStoreId) return;

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

  const url = getDownloadUrl(stockItemById.imageId);
  const imageStyle: CSSProperties = { maxWidth: '400px' };

  return (
    <Fragment>
      <Row>
        <Col span={16}>
          {url ? (
            <img style={imageStyle} src={url} alt="Stock item" />
          ) : null}
        </Col>
      </Row>
      <br />
      <Row>
        <Col span={16}>
          <UploadAttachment onUploadFinish={updateImageId} />
          <TakePicture onPictureTaken={updateImageId} />
        </Col>
      </Row>
    </Fragment>
  );
};

export default Picture;
