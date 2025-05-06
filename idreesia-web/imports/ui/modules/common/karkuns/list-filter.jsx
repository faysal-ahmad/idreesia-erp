import React from 'react';
import PropTypes from 'prop-types';
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
} from '../field-helpers';

const ContainerStyle = {
  width: '500px',
};

const ListFilter = ({
  setPageParams,
  refreshData,

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

  showNameFilter,
  showCnicFilter,
  showPhoneNumberFilter,
  showBloodGroupFilter,
  showLastTarteebFilter,
  showAttendanceFilter,
  showMehfilDutyFilter,
  showUserAccountFilter,
  showEhadKarkunFilter,
  showCityMehfilFilter,
  showRegionFilter,
  showUpdatedBetweenFilter,

  mehfilDuties,
  cities,
  cityMehfils,
  regions,
}) => {
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

  const handleFinish = values => {
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
        values.updatedBetween[0]
          ? values.updatedBetween[0].format(Formats.DATE_FORMAT)
          : '',
        values.updatedBetween[1]
          ? values.updatedBetween[1].format(Formats.DATE_FORMAT)
          : '',
      ]),
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
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
                [cityId, cityMehfilId],
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
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  name: PropTypes.string,
  cnicNumber: PropTypes.string,
  phoneNumber: PropTypes.string,
  bloodGroup: PropTypes.string,
  lastTarteeb: PropTypes.string,
  attendance: PropTypes.string,
  jobId: PropTypes.string,
  dutyId: PropTypes.string,
  dutyShiftId: PropTypes.string,
  ehadKarkun: PropTypes.string,
  cityId: PropTypes.string,
  cityMehfilId: PropTypes.string,
  region: PropTypes.string,
  updatedBetween: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,

  showNameFilter: PropTypes.bool,
  showCnicFilter: PropTypes.bool,
  showPhoneNumberFilter: PropTypes.bool,
  showBloodGroupFilter: PropTypes.bool,
  showLastTarteebFilter: PropTypes.bool,
  showAttendanceFilter: PropTypes.bool,
  showMehfilDutyFilter: PropTypes.bool,
  showDutyShiftFilter: PropTypes.bool,
  showUserAccountFilter: PropTypes.bool,
  showEhadKarkunFilter: PropTypes.bool,
  showCityMehfilFilter: PropTypes.bool,
  showRegionFilter: PropTypes.bool,
  showUpdatedBetweenFilter: PropTypes.bool,

  mehfilDuties: PropTypes.array,
  cities: PropTypes.array,
  cityMehfils: PropTypes.array,
  regions: PropTypes.array,
};

ListFilter.defaultProps = {
  cnicNumber: '',
  showNameFilter: true,
  showCnicFilter: true,
  showPhoneNumberFilter: true,
  showBloodGroupFilter: true,
  showLastTarteebFilter: true,
  showAttendanceFilter: false,
  showMehfilDutyFilter: false,
  showDutyShiftFilter: false,
  showUserAccountFilter: false,
  showEhadKarkunFilter: false,
  showCityMehfilFilter: false,
  showRegionFilter: false,
  showUpdatedBetweenFilter: true,

  mehfilDuties: [],
  cities: [],
  cityMehfils: [],
  regions: [],
};

export default ListFilter;
