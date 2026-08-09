import React, { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { PictureOutlined } from '@ant-design/icons';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Modal } from 'antd';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';

const RouterLink = Link as any;

const NameDivStyle: CSSProperties = {
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
  imageId?: string | null;
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
    <Avatar shape="square" size="large" icon={<PictureOutlined />} />
  );
  if (stockItem.imageId) {
    imageUrl = getDownloadUrl(stockItem.imageId) ?? undefined;
    avatarNode = (
      <Avatar
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
      <div style={NameDivStyle}>
        {avatarNode}
        &nbsp;&nbsp;
        {nameNode}
      </div>
      <Modal
        title={stockItem.name}
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        {imageUrl ? <img src={imageUrl} alt={stockItem.name} /> : null}
      </Modal>
    </>
  );
};

export default StockItemName;
