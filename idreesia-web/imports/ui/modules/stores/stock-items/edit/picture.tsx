import React, { Fragment, type CSSProperties } from 'react';
import { useMutation } from '@apollo/client/react';
import { Button, Row, Col, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';
import type { StockItemByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  readImageFile,
  TakePicture,
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

  const updateImage = (imageData: string) => {
    if (!stockItemById._id || !stockItemById.physicalStoreId) return;

    setStockItemImage({
      variables: {
        _id: stockItemById._id,
        physicalStoreId: stockItemById.physicalStoreId,
        imageData,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const url = stockItemById.imageUrl;
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
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={file => {
              readImageFile(file)
                .then(updateImage)
                .catch((error: Error) => {
                  message.error(error.message, 5);
                });
              // The image is sent with the mutation, not uploaded here.
              return false;
            }}
          >
            <Button type="default">
              <UploadOutlined />
              Upload Picture
            </Button>
          </Upload>
          <TakePicture onPictureCaptured={updateImage} />
        </Col>
      </Row>
    </Fragment>
  );
};

export default Picture;
