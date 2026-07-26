import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { PictureOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

const AntAvatar = Avatar as any;
const AntModal = Modal as any;
const AntPictureOutlined = PictureOutlined as any;
const RouterLink = Link as any;

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

interface StockItem {
  _id: string;
  physicalStoreId: string;
  name: string;
  imageId?: string;
}

interface StockItemNameProps {
  stockItem?: StockItem | null;
  onStockItemNameClicked?(stockItem: StockItem): void;
}

const StockItemName = ({
  stockItem,
  onStockItemNameClicked,
}: StockItemNameProps) => {
  const [showDialog, setShowDialog] = useState(false);
  if (!stockItem) return null;

  const nameNode = onStockItemNameClicked ? (
    <div
      onClick={() => {
        onStockItemNameClicked(stockItem);
      }}
    >
      {stockItem.name}
    </div>
  ) : (
    <RouterLink
      to={paths.stockItemsEditFormPath(
        stockItem.physicalStoreId,
        stockItem._id
      )}
    >
      {stockItem.name}
    </RouterLink>
  );

  let imageUrl: string | undefined;
  let avatarNode = (
    <AntAvatar shape="square" size="large" icon={<AntPictureOutlined />} />
  );
  if (stockItem.imageId) {
    imageUrl = getDownloadUrl(stockItem.imageId) ?? undefined;
    avatarNode = (
      <AntAvatar
        shape="square"
        size="large"
        src={imageUrl}
        onClick={() => {
          setShowDialog(true);
        }}
      />
    );
  }

  return (
    <>
      <div style={NameDivStyle as any}>
        {avatarNode}
        &nbsp;&nbsp;
        {nameNode}
      </div>
      <AntModal
        title={stockItem.name}
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        {imageUrl ? <img src={imageUrl} alt={stockItem.name} /> : null}
      </AntModal>
    </>
  );
};

StockItemName.propTypes = {
  stockItem: PropTypes.shape({
    _id: PropTypes.string,
    physicalStoreId: PropTypes.string,
    name: PropTypes.string,
    imageId: PropTypes.string,
  }),
  onStockItemNameClicked: PropTypes.func,
};

export default StockItemName;
