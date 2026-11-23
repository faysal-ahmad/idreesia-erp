import React from 'react';
import { useMutation } from '@apollo/client/react';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Upload } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  readImageFile,
  TakePicture,
} from '/imports/ui/modules/helpers/controls';

import {
  REMOVE_PURCHASING_CATALOG_ITEM_IMAGE,
  SET_PURCHASING_CATALOG_ITEM_IMAGE,
} from './gql';

interface PictureProps {
  itemId: string;
  imageUrl?: string | null;
}

const REFETCH = ['purchasingCatalogItemById', 'pagedPurchasingCatalogItems'];

/** An item's picture, with upload, camera and remove. Saves straight away. */
const Picture = ({ itemId, imageUrl }: PictureProps) => {
  const [setImage] = useMutation(SET_PURCHASING_CATALOG_ITEM_IMAGE, {
    refetchQueries: REFETCH,
  });
  const [removeImage] = useMutation(REMOVE_PURCHASING_CATALOG_ITEM_IMAGE, {
    refetchQueries: REFETCH,
  });

  const reportError = (error: Error) => message.error(error.message, 5);

  const updateImage = (imageData: string) => {
    setImage({ variables: { _id: itemId, imageData } })
      .then(() => message.success('Picture saved', 2))
      .catch(reportError);
  };

  return (
    <>
      {imageUrl ? (
        <img
          style={{ maxWidth: 400, maxHeight: 400, display: 'block', marginBottom: 16 }}
          src={imageUrl}
          alt="Catalog item"
        />
      ) : (
        <p style={{ color: '#667085' }}>This item has no picture yet.</p>
      )}
      <Space wrap>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            readImageFile(file).then(updateImage).catch(reportError);
            // The image is sent with the mutation, not uploaded here.
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Upload Picture</Button>
        </Upload>
        <TakePicture onPictureCaptured={updateImage} />
        {imageUrl ? (
          <Popconfirm
            title="Remove this picture?"
            okText="Yes"
            cancelText="No"
            onConfirm={() =>
              removeImage({ variables: { _id: itemId } })
                .then(() => message.success('Picture removed', 2))
                .catch(reportError)
            }
          >
            <Button danger icon={<DeleteOutlined />}>
              Remove Picture
            </Button>
          </Popconfirm>
        ) : null}
      </Space>
    </>
  );
};

export default Picture;
