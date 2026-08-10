import React, { Fragment, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Drawer, Input } from 'antd';

import type { PagedStockItemsQuery } from 'meteor/idreesia-common/types/client-operations';
import ListContainer from './list-container';

type StockItem = NonNullable<
  NonNullable<
    NonNullable<PagedStockItemsQuery['pagedStockItems']>['data']
  >[number]
>;

interface Props {
  value?: StockItem | null;
  disabled?: boolean;
  placeholder?: string;
  onChange?(stockItem: StockItem): void;
  physicalStoreId?: string;
}

const CustomInput = ({
  value,
  disabled,
  placeholder,
  onChange,
  physicalStoreId,
}: Props) => {
  const [showSelectionForm, setShowSelectionForm] = useState(false);

  const handleEditClick = () => {
    if (!disabled) {
      setShowSelectionForm(true);
    }
  };

  const handleClose = () => {
    setShowSelectionForm(false);
  };

  const setSelectedValue = (stockItem: StockItem) => {
    handleClose();
    onChange?.(stockItem);
  };

  return (
    <Fragment>
      <Drawer
        title="Select a Stock Item"
        size={720}
        onClose={handleClose}
        open={showSelectionForm}
      >
        <ListContainer
          setSelectedValue={setSelectedValue}
          physicalStoreId={physicalStoreId}
        />
      </Drawer>
      <Input
        type="text"
        value={value ? value.formattedName ?? '' : ''}
        readOnly
        addonAfter={<EditOutlined onClick={handleEditClick} />}
        placeholder={placeholder}
      />
    </Fragment>
  );
};

export default CustomInput;
