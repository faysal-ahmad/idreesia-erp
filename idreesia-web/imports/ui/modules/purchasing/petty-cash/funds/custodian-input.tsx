import React, { useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Drawer, Input } from 'antd';

import type { KarkunSelectionItem } from '/imports/ui/modules/helpers/controls';

import KarkunPicker from '../../permissions/karkun-picker';
import { PURCHASING_PETTY_CASH_CUSTODIAN_SEARCH } from '../gql';

export interface CustodianValue {
  _id?: string;
  name?: string;
}

interface Props {
  value?: CustodianValue | null;
  onChange?: (value: CustodianValue) => void;
  placeholder?: string;
}

/**
 * Picks a fund's custodian from the people who hold a Purchasing permission,
 * not from every karkun. Works as a Form.Item control.
 */
const CustodianInput = ({ value, onChange, placeholder }: Props) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (karkun: KarkunSelectionItem) => {
    setOpen(false);
    onChange?.({ _id: karkun._id, name: karkun.name ?? undefined });
  };

  return (
    <>
      <Drawer title="Select the Custodian" size={800} open={open} onClose={() => setOpen(false)} destroyOnHidden>
        <KarkunPicker
          query={PURCHASING_PETTY_CASH_CUSTODIAN_SEARCH}
          dataKey="purchasingPettyCashCustodianSearch"
          addLabel="Select"
          selectedLabel="Selected"
          selectedIds={value?._id ? [value._id] : []}
          onAdd={handleSelect}
        />
      </Drawer>
      <Input
        type="text"
        value={value?.name ?? ''}
        readOnly
        addonAfter={<EditOutlined onClick={() => setOpen(true)} />}
        placeholder={placeholder}
      />
    </>
  );
};

export default CustodianInput;
