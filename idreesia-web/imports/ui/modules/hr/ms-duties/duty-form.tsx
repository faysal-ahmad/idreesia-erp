import React from 'react';
import { Form, Input, Select, type FormInstance } from 'antd';

import { useAllCommittees } from '/imports/ui/modules/hr/common/hooks';

export interface DutyFormValues {
  name: string;
  description?: string;
  committeeId?: string;
}

interface DutyFormProps {
  form: FormInstance<DutyFormValues>;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const DutyForm = ({ form }: DutyFormProps) => {
  const { allCommittees } = useAllCommittees();
  const committeeOptions = (allCommittees ?? []).flatMap(committee =>
    committee?._id && committee.name
      ? [{ value: committee._id, label: committee.name }]
      : []
  );

  return (
    <Form
      form={form}
      layout="horizontal"
      style={{ width: '100%', maxWidth: '100%' }}
      preserve={false}
    >
      <Form.Item
        name="name"
        label="Duty Name"
        rules={[
          {
            required: true,
            message: 'Please input a name for the duty.',
          },
        ]}
        {...formItemLayout}
      >
        <Input />
      </Form.Item>
      <Form.Item name="committeeId" label="Committee" {...formItemLayout}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Committee responsible for this duty"
          options={committeeOptions}
        />
      </Form.Item>
      <Form.Item name="description" label="Description" {...formItemLayout}>
        <Input.TextArea rows={4} />
      </Form.Item>
    </Form>
  );
};

export default DutyForm;
