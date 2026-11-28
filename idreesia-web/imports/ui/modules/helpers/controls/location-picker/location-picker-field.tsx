import React from 'react';
import { Form } from 'antd';
import type { Rule } from 'antd/es/form';

import LocationTreeSelect from './location-tree-select';
import { useReferenceLocations } from './use-reference-locations';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface Props {
  fieldName: string;
  fieldLabel?: string;
  /** Location types loaded into the tree (with their ancestors). */
  types: string[];
  /** Types that can be picked; defaults to all of `types`. */
  selectableTypes?: string[];
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: string | null;
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  allowClear?: boolean;
  rules?: Rule[];
}

/** A Form.Item holding one location id, picked from the location tree. */
const LocationPickerField = ({
  fieldName,
  fieldLabel,
  types,
  selectableTypes = types,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue,
  required,
  requiredMessage,
  disabled,
  allowClear,
  rules = [],
}: Props) => {
  const { locations, loading } = useReferenceLocations(types);

  return (
    <Form.Item
      name={fieldName}
      label={fieldLabel}
      initialValue={initialValue ?? undefined}
      rules={[{ required, message: requiredMessage }, ...rules]}
      {...fieldLayout}
    >
      <LocationTreeSelect
        locations={locations}
        selectableTypes={selectableTypes}
        loading={loading}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
      />
    </Form.Item>
  );
};

export default LocationPickerField;
