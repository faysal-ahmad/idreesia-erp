import React, { useMemo, useState, type CSSProperties } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
  Button,
  Flex,
  Form,
  Popover,
  Space,
  Tag,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { startCase } from 'meteor/idreesia-common/utilities/lodash';

import {
  getNameFilterField,
  getCnicNumberFilterField,
  getPhoneNumberFilterField,
  getBloodGroupFilterField,
  getLastTarteebFilterField,
  getAttendanceFilterField,
  getMehfilDutyFilterField,
  getCityMehfilFilterField,
  getEhadKarkunFilterField,
  getUserAccountFilterField,
  getRegionFilterField,
  getUpdatedBetweenFilterField,
  type CityLookupItem,
  type FieldValue,
  type LookupItem,
  type MehfilLookupItem,
} from '../field-helpers';

export interface PageParams {
  pageIndex: string;
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  lastTarteeb?: string | null;
  attendance?: string | null;
  jobId?: string | null;
  dutyId?: string | null;
  dutyShiftId?: string | null;
  userAccount?: string | null;
  ehadKarkun?: string | null;
  cityId?: string | null;
  cityMehfilId?: string | null;
  region?: string | null;
  updatedBetween?: string | null;
}

interface FilterFormValues {
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  lastTarteeb?: string;
  attendance?: string;
  jobId?: string;
  dutyId?: string;
  dutyShiftId?: string;
  userAccount?: string;
  ehadKarkun?: string;
  cityIdMehfilId?: [string, string] | null;
  region?: string;
  updatedBetween?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
}

export interface Props {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  mehfilDuties?: LookupItem[];
  cities?: CityLookupItem[];
  cityMehfils?: MehfilLookupItem[];
  regions?: string[];
  name?: string | null;
  cnicNumber?: string;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  lastTarteeb?: string | null;
  attendance?: string | null;
  dutyId?: string | null;
  userAccount?: string | null;
  ehadKarkun?: string | null;
  cityId?: string | null;
  cityMehfilId?: string | null;
  region?: string | null;
  updatedBetween?: string | null;
  showNameFilter?: boolean;
  showCnicFilter?: boolean;
  showPhoneNumberFilter?: boolean;
  showBloodGroupFilter?: boolean;
  showLastTarteebFilter?: boolean;
  showAttendanceFilter?: boolean;
  showMehfilDutyFilter?: boolean;
  showUserAccountFilter?: boolean;
  showEhadKarkunFilter?: boolean;
  showCityMehfilFilter?: boolean;
  showRegionFilter?: boolean;
  showUpdatedBetweenFilter?: boolean;
}

type FilterChipKey =
  | 'name'
  | 'cnicNumber'
  | 'phoneNumber'
  | 'bloodGroup'
  | 'lastTarteeb'
  | 'attendance'
  | 'duty'
  | 'userAccount'
  | 'ehadKarkun'
  | 'cityMehfil'
  | 'region'
  | 'updatedBetween';

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

const BLOOD_GROUP_LABELS: Record<string, string> = {
  'A-': 'A-',
  Aplus: 'A+',
  'B-': 'B-',
  Bplus: 'B+',
  'AB-': 'AB-',
  ABplus: 'AB+',
  'O-': 'O-',
  Oplus: 'O+',
};

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

const formatYesNo = (value?: string | null) => {
  if (value === 'true') return 'Yes';
  if (value === 'false') return 'No';
  return String(value);
};

const formatLastTarteeb = (value?: string | null) => {
  if (!value) return '';
  try {
    const { scale, duration } = JSON.parse(value) as {
      scale?: string;
      duration?: number | null;
    };
    if (duration == null) return '';
    return `More Than ${duration} ${startCase(scale ?? '')}`;
  } catch {
    return '';
  }
};

const formatAttendance = (value?: string | null) => {
  if (!value) return '';
  try {
    const { criteria, percentage } = JSON.parse(value) as {
      criteria?: string;
      percentage?: number | null;
    };
    if (percentage == null) return '';
    return `${criteria === 'more-than' ? 'More Than' : 'Less Than'} ${percentage}%`;
  } catch {
    return '';
  }
};

const formatUpdatedBetween = (value?: string | null) => {
  if (!value) return '';
  try {
    const [start, end] = JSON.parse(value) as [string, string];
    if (!start && !end) return '';
    return `${start || '...'} - ${end || '...'}`;
  } catch {
    return '';
  }
};

type ChipInputs = Pick<
  Props,
  | 'name'
  | 'cnicNumber'
  | 'phoneNumber'
  | 'bloodGroup'
  | 'lastTarteeb'
  | 'attendance'
  | 'dutyId'
  | 'userAccount'
  | 'ehadKarkun'
  | 'cityId'
  | 'cityMehfilId'
  | 'region'
  | 'updatedBetween'
  | 'mehfilDuties'
  | 'cities'
  | 'cityMehfils'
>;

export const getKarkunsFilterChips = ({
  name,
  cnicNumber,
  phoneNumber,
  bloodGroup,
  lastTarteeb,
  attendance,
  dutyId,
  userAccount,
  ehadKarkun,
  cityId,
  cityMehfilId,
  region,
  updatedBetween,
  mehfilDuties = [],
  cities = [],
  cityMehfils = [],
}: ChipInputs): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (hasFilterValue(name)) {
    chips.push({ key: 'name', label: 'Name', value: String(name) });
  }
  if (hasFilterValue(cnicNumber)) {
    chips.push({ key: 'cnicNumber', label: 'CNIC', value: String(cnicNumber) });
  }
  if (hasFilterValue(phoneNumber)) {
    chips.push({ key: 'phoneNumber', label: 'Phone', value: String(phoneNumber) });
  }
  if (hasFilterValue(bloodGroup)) {
    chips.push({
      key: 'bloodGroup',
      label: 'Blood Group',
      value: BLOOD_GROUP_LABELS[String(bloodGroup)] || String(bloodGroup),
    });
  }
  const lastTarteebLabel = formatLastTarteeb(lastTarteeb);
  if (lastTarteebLabel) {
    chips.push({ key: 'lastTarteeb', label: 'Last Tarteeb', value: lastTarteebLabel });
  }
  const attendanceLabel = formatAttendance(attendance);
  if (attendanceLabel) {
    chips.push({ key: 'attendance', label: 'Attendance', value: attendanceLabel });
  }
  if (hasFilterValue(dutyId)) {
    const dutyName =
      mehfilDuties.find(duty => duty._id === dutyId)?.name ?? String(dutyId);
    chips.push({ key: 'duty', label: 'Duty', value: dutyName as string });
  }
  if (hasFilterValue(userAccount)) {
    chips.push({
      key: 'userAccount',
      label: 'User Account',
      value: formatYesNo(userAccount),
    });
  }
  if (hasFilterValue(ehadKarkun)) {
    chips.push({
      key: 'ehadKarkun',
      label: 'Ehad Karkun',
      value: formatYesNo(ehadKarkun),
    });
  }
  if (hasFilterValue(cityId) || hasFilterValue(cityMehfilId)) {
    const cityName = cities.find(city => city._id === cityId)?.name;
    const mehfilName = cityMehfils.find(
      mehfil => mehfil._id === cityMehfilId
    )?.name;
    chips.push({
      key: 'cityMehfil',
      label: 'City/Mehfil',
      value:
        [cityName, mehfilName].filter(Boolean).join(' / ') ||
        [cityId, cityMehfilId].filter(Boolean).join(' / '),
    });
  }
  if (hasFilterValue(region)) {
    chips.push({ key: 'region', label: 'Region', value: String(region) });
  }
  const updatedBetweenLabel = formatUpdatedBetween(updatedBetween);
  if (updatedBetweenLabel) {
    chips.push({ key: 'updatedBetween', label: 'Updated', value: updatedBetweenLabel });
  }

  return chips;
};

export const KarkunsFilterChips = (props: Props) => {
  const {
    setPageParams,
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    attendance,
    dutyId,
    userAccount,
    ehadKarkun,
    cityId,
    cityMehfilId,
    region,
    updatedBetween,
    mehfilDuties,
    cities,
    cityMehfils,
  } = props;

  const chips = useMemo(
    () =>
      getKarkunsFilterChips({
        name,
        cnicNumber,
        phoneNumber,
        bloodGroup,
        lastTarteeb,
        attendance,
        dutyId,
        userAccount,
        ehadKarkun,
        cityId,
        cityMehfilId,
        region,
        updatedBetween,
        mehfilDuties,
        cities,
        cityMehfils,
      }),
    [
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      lastTarteeb,
      attendance,
      dutyId,
      userAccount,
      ehadKarkun,
      cityId,
      cityMehfilId,
      region,
      updatedBetween,
      mehfilDuties,
      cities,
      cityMehfils,
    ]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChipKey) => {
    if (key === 'duty') {
      setPageParams({ pageIndex: '0', dutyId: null, dutyShiftId: null });
      return;
    }
    if (key === 'cityMehfil') {
      setPageParams({ pageIndex: '0', cityId: null, cityMehfilId: null });
      return;
    }
    if (key === 'updatedBetween') {
      setPageParams({
        pageIndex: '0',
        updatedBetween: JSON.stringify(['', '']),
      });
      return;
    }
    setPageParams({ pageIndex: '0', [key]: null });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: '0',
      name: null,
      cnicNumber: null,
      phoneNumber: null,
      bloodGroup: null,
      lastTarteeb: null,
      attendance: null,
      jobId: null,
      dutyId: null,
      dutyShiftId: null,
      userAccount: null,
      ehadKarkun: null,
      cityId: null,
      cityMehfilId: null,
      region: null,
      updatedBetween: JSON.stringify(['', '']),
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
  lastTarteeb,
  attendance,
  dutyId,
  userAccount,
  ehadKarkun,
  cityId,
  cityMehfilId,
  region,
  updatedBetween,

  showNameFilter = true,
  showCnicFilter = true,
  showPhoneNumberFilter = true,
  showBloodGroupFilter = true,
  showLastTarteebFilter = true,
  showAttendanceFilter = false,
  showMehfilDutyFilter = false,
  showUserAccountFilter = false,
  showEhadKarkunFilter = false,
  showCityMehfilFilter = false,
  showRegionFilter = false,
  showUpdatedBetweenFilter = true,

  mehfilDuties = [],
  cities = [],
  cityMehfils = [],
  regions = [],
}: Props) => {
  const [form] = Form.useForm<FilterFormValues>();
  const [open, setOpen] = useState(false);

  const activeFilterCount = getKarkunsFilterChips({
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    attendance,
    dutyId,
    userAccount,
    ehadKarkun,
    cityId,
    cityMehfilId,
    region,
    updatedBetween,
    mehfilDuties,
    cities,
    cityMehfils,
  }).length;

  const syncFormValues = () => {
    let updatedBetweenValue: FilterFormValues['updatedBetween'] = [null, null];
    if (updatedBetween) {
      const dates = JSON.parse(updatedBetween) as [string, string];
      updatedBetweenValue = [
        dates[0] ? dayjs(dates[0], Formats.DATE_FORMAT) : null,
        dates[1] ? dayjs(dates[1], Formats.DATE_FORMAT) : null,
      ];
    }

    form.setFieldsValue({
      name: name ?? undefined,
      cnicNumber,
      phoneNumber: phoneNumber ?? undefined,
      bloodGroup: bloodGroup ?? undefined,
      lastTarteeb: lastTarteeb ?? undefined,
      attendance: attendance ?? undefined,
      dutyId: dutyId ?? undefined,
      userAccount: userAccount ?? undefined,
      ehadKarkun: ehadKarkun ?? undefined,
      cityIdMehfilId:
        cityId || cityMehfilId
          ? ([cityId, cityMehfilId].filter(Boolean) as [string, string])
          : null,
      region: region ?? undefined,
      updatedBetween: updatedBetweenValue,
    });
  };

  const handleFinish = (values: FilterFormValues) => {
    setPageParams({
      pageIndex: '0',
      name: values.name,
      cnicNumber: values.cnicNumber,
      phoneNumber: values.phoneNumber,
      bloodGroup: values.bloodGroup,
      lastTarteeb: values.lastTarteeb,
      attendance: values.attendance,
      jobId: values.jobId,
      dutyId: values.dutyId,
      dutyShiftId: values.dutyShiftId,
      userAccount: values.userAccount,
      ehadKarkun: values.ehadKarkun,
      cityId: values.cityIdMehfilId ? values.cityIdMehfilId[0] : null,
      cityMehfilId: values.cityIdMehfilId ? values.cityIdMehfilId[1] : null,
      region: values.region,
      updatedBetween: JSON.stringify([
        values.updatedBetween?.[0]
          ? values.updatedBetween?.[0].format(Formats.DATE_FORMAT)
          : '',
        values.updatedBetween?.[1]
          ? values.updatedBetween?.[1].format(Formats.DATE_FORMAT)
          : '',
      ]),
    });
    setOpen(false);
  };

  const handleRefresh = () => {
    if (!refreshData) return;
    refreshData().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      <Form
        form={form}
        layout="horizontal"
        style={FilterFormStyle}
        onFinish={handleFinish}
      >
        {showNameFilter ? getNameFilterField(name) : null}
        {showCnicFilter ? getCnicNumberFilterField(cnicNumber) : null}
        {showPhoneNumberFilter ? getPhoneNumberFilterField(phoneNumber) : null}
        {showBloodGroupFilter ? getBloodGroupFilterField(bloodGroup) : null}
        {showLastTarteebFilter ? getLastTarteebFilterField(lastTarteeb) : null}
        {showAttendanceFilter ? getAttendanceFilterField(attendance) : null}
        {showUserAccountFilter ? getUserAccountFilterField(userAccount) : null}
        {showMehfilDutyFilter
          ? getMehfilDutyFilterField(dutyId, mehfilDuties)
          : null}
        {showEhadKarkunFilter ? getEhadKarkunFilterField(ehadKarkun) : null}
        {showCityMehfilFilter
          ? getCityMehfilFilterField(
              [cityId, cityMehfilId] as FieldValue,
              cities,
              cityMehfils
            )
          : null}
        {showRegionFilter ? getRegionFilterField(region, regions) : null}
        {showUpdatedBetweenFilter
          ? getUpdatedBetweenFilterField(updatedBetween)
          : null}
        <Form.Item style={{ marginBottom: 0 }}>
          <Flex justify="flex-end">
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Flex>
        </Form.Item>
      </Form>
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
