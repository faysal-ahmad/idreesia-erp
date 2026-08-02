import React, { type CSSProperties } from 'react';
import type { Dayjs } from 'dayjs';
import { Collapse, Form } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

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
  getFormButtons,
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
  updatedBetween?: [Dayjs | null, Dayjs | null] | null;
}

interface Props {
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

const ContainerStyle: CSSProperties = {
  width: '500px',
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
  const handleReset = () => {
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
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  return (
    <Collapse
      style={ContainerStyle}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
            <Form layout="horizontal" onFinish={handleFinish}>
              {showNameFilter ? getNameFilterField(name) : null}
              {showCnicFilter
                ? getCnicNumberFilterField(cnicNumber)
                : null}
              {showPhoneNumberFilter
                ? getPhoneNumberFilterField(phoneNumber)
                : null}
              {showBloodGroupFilter
                ? getBloodGroupFilterField(bloodGroup)
                : null}
              {showLastTarteebFilter
                ? getLastTarteebFilterField(lastTarteeb)
                : null}
              {showAttendanceFilter
                ? getAttendanceFilterField(attendance)
                : null}
              {showUserAccountFilter
                ? getUserAccountFilterField(userAccount)
                : null}
              {showMehfilDutyFilter
                ? getMehfilDutyFilterField(dutyId, mehfilDuties)
                : null}
              {showEhadKarkunFilter
                ? getEhadKarkunFilterField(ehadKarkun)
                : null}
              {showCityMehfilFilter
                ? getCityMehfilFilterField(
                    [cityId, cityMehfilId] as FieldValue,
                    cities,
                    cityMehfils
                  )
                : null}
              {showRegionFilter
                ? getRegionFilterField(region, regions)
                : null}

              {showUpdatedBetweenFilter
                ? getUpdatedBetweenFilterField(updatedBetween)
                : null}
              {getFormButtons(handleReset)}
            </Form>
          ),
        },
      ]}
    />
  );
};

export default ListFilter;
