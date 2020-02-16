import React from 'react';
import PropTypes from 'prop-types';

import { Collapse, Form, Icon, Tooltip } from '/imports/ui/controls';

import {
  getNameFilterField,
  getCnicNumberFilterField,
  getPhoneNumberFilterField,
  getBloodGroupFilterField,
  getMehfilDutyFilterField,
  getCityMehfilFilterField,
  getRegionFilterField,
  getFormButtons,
} from './helpers';

const ContainerStyle = {
  width: '500px',
};

const ListFilter = ({
  form,
  setPageParams,
  refreshData,

  name,
  cnicNumber,
  phoneNumber,
  bloodGroup,
  dutyId,
  cityId,
  cityMehfilId,
  region,

  showNameFilter,
  showCnicFilter,
  showPhoneNumberFilter,
  showBloodGroupFilter,
  showMehfilDutyFilter,
  showCityMehfilFilter,
  showRegionFilter,

  mehfilDuties,
  cities,
  cityMehfils,
  regions,
}) => {
  const handleReset = () => {
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      name: null,
      cnicNumber: null,
      phoneNumber: null,
      bloodGroup: null,
      jobId: null,
      dutyId: null,
      dutyShiftId: null,
      cityId: null,
      cityMehfilId: null,
      region: null,
    });
  };

  const handleSubmit = () => {
    form.validateFields((err, values) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        ...values,
      });
    });
  };

  const refreshButton = () => {
    if (!refreshData) return null;
    return (
      <Tooltip title="Reload Data">
        <Icon
          type="sync"
          onClick={event => {
            event.stopPropagation();
            if (refreshData) refreshData();
          }}
        />
      </Tooltip>
    );
  };

  const { getFieldDecorator } = form;

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal">
          {showNameFilter ? getNameFilterField(name, getFieldDecorator) : null}
          {showCnicFilter
            ? getCnicNumberFilterField(cnicNumber, getFieldDecorator)
            : null}
          {showPhoneNumberFilter
            ? getPhoneNumberFilterField(phoneNumber, getFieldDecorator)
            : null}
          {showBloodGroupFilter
            ? getBloodGroupFilterField(bloodGroup, getFieldDecorator)
            : null}
          {showMehfilDutyFilter
            ? getMehfilDutyFilterField(dutyId, getFieldDecorator, mehfilDuties)
            : null}
          {showCityMehfilFilter
            ? getCityMehfilFilterField(
                [cityId, cityMehfilId],
                getFieldDecorator,
                cities,
                cityMehfils
              )
            : null}
          {showRegionFilter
            ? getRegionFilterField(region, getFieldDecorator, regions)
            : null}
          {getFormButtons(handleReset, handleSubmit)}
        </Form>
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  form: PropTypes.object,
  name: PropTypes.string,
  cnicNumber: PropTypes.string,
  phoneNumber: PropTypes.string,
  bloodGroup: PropTypes.string,
  isEmployee: PropTypes.bool,
  jobId: PropTypes.string,
  dutyId: PropTypes.string,
  dutyShiftId: PropTypes.string,
  cityId: PropTypes.string,
  cityMehfilId: PropTypes.string,
  region: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,

  showPanel: PropTypes.bool,
  showNameFilter: PropTypes.bool,
  showCnicFilter: PropTypes.bool,
  showPhoneNumberFilter: PropTypes.bool,
  showBloodGroupFilter: PropTypes.bool,
  showMehfilDutyFilter: PropTypes.bool,
  showDutyShiftFilter: PropTypes.bool,
  showCityMehfilFilter: PropTypes.bool,
  showRegionFilter: PropTypes.bool,

  mehfilDuties: PropTypes.array,
  cities: PropTypes.array,
  cityMehfils: PropTypes.array,
  regions: PropTypes.array,
};

ListFilter.defaultProps = {
  cnicNumber: '',
  showPanel: true,
  showNameFilter: true,
  showCnicFilter: true,
  showPhoneNumberFilter: true,
  showBloodGroupFilter: true,
  showMehfilDutyFilter: false,
  showDutyShiftFilter: false,
  showCityMehfilFilter: false,
  showRegionFilter: false,

  mehfilDuties: [],
  cities: [],
  cityMehfils: [],
  regions: [],
};

export default Form.create({ name: 'karkunsListFilter' })(ListFilter);
