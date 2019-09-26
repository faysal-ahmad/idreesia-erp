import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { Avatar, Modal } from '/imports/ui/controls';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { getDownloadUrl } from '/imports/ui/modules/helpers/misc';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  color: '#1890ff',
  cursor: 'pointer',
};

const StockItemName = ({ stockItem, onStockItemNameClicked }) => {
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
    <Link
      to={paths.stockItemsEditFormPath(
        stockItem.physicalStoreId,
        stockItem._id
      )}
    >
      {stockItem.name}
    </Link>
  );

  let imageUrl;
  let avatarNode = <Avatar shape="square" size="large" icon="picture" />;
  if (stockItem.imageId) {
    imageUrl = getDownloadUrl(stockItem.imageId);
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
        visible={showDialog}
        onCancel={() => setShowDialog(false)}
        footer={null}
      >
        <img src={imageUrl} />
      </Modal>
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
