import React, { useMemo, useState, type CSSProperties } from 'react';
import {
  Badge,
  Button,
  Flex,
  Form,
  Popover,
  Space,
  Spin,
  Tag,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import {
  CascaderField,
  InputCnicField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';
import {
  useAllMSDuties,
  useAllDutyShifts,
} from '/imports/ui/modules/hr/common/hooks';

interface LabelValue {
  label: string;
  value: string;
}

export interface PageParams {
  pageIndex?: number | string;
  pageSize?: number | string;
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  dutyId?: string | null;
  dutyShiftId?: string | null;
}

interface FilterFormValues {
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  dutyIdShiftId?: string[];
}

export interface KarkunsListFilterProps {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  dutyId?: string | null;
  dutyShiftId?: string | null;
}

type FilterChipKey =
  | 'name'
  | 'cnicNumber'
  | 'phoneNumber'
  | 'bloodGroup'
  | 'duty';

interface FilterChip {
  key: FilterChipKey;
  label: string;
  value: string;
}

const FilterPanelStyle: CSSProperties = {
  width: 640,
  paddingTop: 4,
  overflow: 'visible',
};

const FilterFormStyle: CSSProperties = {
  width: '100%',
};

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const BLOOD_GROUP_OPTIONS: LabelValue[] = [
  { label: 'A-', value: 'A-' },
  { label: 'A+', value: 'Aplus' },
  { label: 'B-', value: 'B-' },
  { label: 'B+', value: 'Bplus' },
  { label: 'AB-', value: 'AB-' },
  { label: 'AB+', value: 'ABplus' },
  { label: 'O-', value: 'O-' },
  { label: 'O+', value: 'Oplus' },
];

const BLOOD_GROUP_LABELS = Object.fromEntries(
  BLOOD_GROUP_OPTIONS.map(({ value, label }) => [value, label])
) as Record<string, string>;

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

export const getKarkunsFilterChips = ({
  name,
  cnicNumber,
  phoneNumber,
  bloodGroup,
  dutyId,
  dutyShiftId,
  dutyLabel,
}: Pick<
  KarkunsListFilterProps,
  'name' | 'cnicNumber' | 'phoneNumber' | 'bloodGroup' | 'dutyId' | 'dutyShiftId'
> & {
  dutyLabel?: string;
}): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (hasFilterValue(name)) {
    chips.push({ key: 'name', label: 'Name', value: String(name) });
  }
  if (hasFilterValue(cnicNumber)) {
    chips.push({
      key: 'cnicNumber',
      label: 'CNIC',
      value: String(cnicNumber),
    });
  }
  if (hasFilterValue(phoneNumber)) {
    chips.push({
      key: 'phoneNumber',
      label: 'Phone',
      value: String(phoneNumber),
    });
  }
  if (hasFilterValue(bloodGroup)) {
    chips.push({
      key: 'bloodGroup',
      label: 'Blood Group',
      value: BLOOD_GROUP_LABELS[String(bloodGroup)] || String(bloodGroup),
    });
  }
  if (hasFilterValue(dutyId) || hasFilterValue(dutyShiftId)) {
    chips.push({
      key: 'duty',
      label: 'Duty/Shift',
      value: dutyLabel || [dutyId, dutyShiftId].filter(Boolean).join(' / '),
    });
  }

  return chips;
};

export const KarkunsFilterChips = ({
  setPageParams,
  name,
  cnicNumber,
  phoneNumber,
  bloodGroup,
  dutyId,
  dutyShiftId,
}: KarkunsListFilterProps) => {
  const { allMSDuties } = useAllMSDuties();
  const { allDutyShifts } = useAllDutyShifts();

  const dutyLabel = useMemo(() => {
    if (!hasFilterValue(dutyId) && !hasFilterValue(dutyShiftId)) {
      return undefined;
    }
    const dutyName =
      (allMSDuties ?? []).find(duty => duty?._id === dutyId)?.name ?? '';
    const shiftName =
      (allDutyShifts ?? []).find(shift => shift?._id === dutyShiftId)?.name ??
      '';
    return [dutyName, shiftName].filter(Boolean).join(' / ') || undefined;
  }, [allMSDuties, allDutyShifts, dutyId, dutyShiftId]);

  const chips = useMemo(
    () =>
      getKarkunsFilterChips({
        name,
        cnicNumber,
        phoneNumber,
        bloodGroup,
        dutyId,
        dutyShiftId,
        dutyLabel,
      }),
    [name, cnicNumber, phoneNumber, bloodGroup, dutyId, dutyShiftId, dutyLabel]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChipKey) => {
    if (key === 'duty') {
      setPageParams({
        pageIndex: 0,
        dutyId: '',
        dutyShiftId: '',
      });
      return;
    }
    setPageParams({
      pageIndex: 0,
      [key]: '',
    });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: 0,
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      bloodGroup: '',
      dutyId: '',
      dutyShiftId: '',
    });
  };

  return (
    <Flex
      wrap="wrap"
      gap={8}
      align="center"
      justify="flex-end"
      className="list-filter-chips"
    >
      {chips.map(chip => (
        <Tag
          key={chip.key}
          closable
          onClose={event => {
            event.preventDefault();
            clearChip(chip.key);
          }}
        >
          <span>
            {chip.label}: {chip.value}
          </span>
        </Tag>
      ))}
      <Button type="link" size="small" onClick={clearAll}>
        Clear all
      </Button>
    </Flex>
  );
};

const ListFilter = ({
  setPageParams,
  refreshData,
  name,
  cnicNumber = '',
  phoneNumber,
  bloodGroup,
  dutyId,
  dutyShiftId,
}: KarkunsListFilterProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyShifts, allDutyShiftsLoading } = useAllDutyShifts();

  const lookupsLoading = allMSDutiesLoading || allDutyShiftsLoading;

  const activeFilterCount = getKarkunsFilterChips({
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    dutyId,
    dutyShiftId,
  }).length;

  const syncFormValues = () => {
    form.setFieldsValue({
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      dutyIdShiftId: [dutyId, dutyShiftId].filter(Boolean),
    });
  };

  const handleFinish = (values: FilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      name: values.name,
      cnicNumber: values.cnicNumber,
      phoneNumber: values.phoneNumber,
      bloodGroup: values.bloodGroup,
      dutyId: values.dutyIdShiftId?.[0],
      dutyShiftId: values.dutyIdShiftId?.[1],
    });
    setOpen(false);
  };

  const handleRefresh = () => {
    if (!refreshData) return;
    refreshData().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const duties = (allMSDuties ?? []).filter(
    (duty): duty is NonNullable<typeof duty> => duty != null
  );
  const shifts = (allDutyShifts ?? []).filter(
    (shift): shift is NonNullable<typeof shift> => shift != null
  );
  const dutyShiftCascaderData = getDutyShiftCascaderData(duties, shifts);

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      {lookupsLoading ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="horizontal"
          style={FilterFormStyle}
          onFinish={handleFinish}
        >
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            required={false}
            fieldLayout={formItemLayout}
            initialValue={name}
          />
          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            required={false}
            requiredMessage="Please input a valid CNIC number."
            fieldLayout={formItemLayout}
            initialValue={cnicNumber}
          />
          <InputTextField
            fieldName="phoneNumber"
            fieldLabel="Phone Number"
            required={false}
            fieldLayout={formItemLayout}
            initialValue={phoneNumber}
          />
          <SelectField<LabelValue>
            fieldName="bloodGroup"
            fieldLabel="Blood Group"
            required={false}
            data={BLOOD_GROUP_OPTIONS}
            getDataValue={({ value }) => value}
            getDataText={({ label }) => label}
            fieldLayout={formItemLayout}
            initialValue={bloodGroup}
          />
          <CascaderField
            data={dutyShiftCascaderData}
            fieldName="dutyIdShiftId"
            fieldLabel="Duty/Shift"
            fieldLayout={formItemLayout}
            initialValue={[dutyId, dutyShiftId].filter(Boolean)}
            required={false}
          />
          <Form.Item style={{ marginBottom: 0 }}>
            <Flex justify="flex-end">
              <Button type="primary" htmlType="submit">
                Search
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      )}
    </div>
  );

  return (
    <Space size={8}>
      <Popover
        trigger="click"
        placement="bottomRight"
        open={open}
        onOpenChange={nextOpen => {
          if (nextOpen) syncFormValues();
          setOpen(nextOpen);
        }}
        content={filterForm}
      >
        <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
          <Button icon={<FilterOutlined />}>Filter</Button>
        </Badge>
      </Popover>
      {refreshData ? (
        <Button
          icon={<SyncOutlined />}
          onClick={handleRefresh}
          title="Reload Data"
        />
      ) : null}
    </Space>
  );
};

export default ListFilter;
