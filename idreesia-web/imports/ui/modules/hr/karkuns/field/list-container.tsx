import React, { Component } from 'react';
import PropTypes from 'prop-types';

import List from '../list/list';

const KarkunList = List as any;
interface SelectionValue { _id?: string; name?: string; sharedData?: { name?: string }; }
interface ListContainerProps { setSelectedValue?(value: SelectionValue): void; predefinedFilterName?: string; predefinedFilterStoreId?: string; }
interface ListContainerState { pageIndex: number; pageSize: number; name: string | null; cnicNumber: string | null; phoneNumber: string | null; bloodGroup: string | null; jobId: string | null; dutyId: string | null; dutyShiftId: string | null; karkunType: string[]; }

export default class ListContainer extends Component<ListContainerProps, ListContainerState> {
  static propTypes = {
    setSelectedValue: PropTypes.func,
    predefinedFilterName: PropTypes.string,
    predefinedFilterStoreId: PropTypes.string,
  };

  state = {
    pageIndex: 0,
    pageSize: 20,
    name: null,
    cnicNumber: null,
    phoneNumber: null,
    bloodGroup: null,
    jobId: null,
    dutyId: null,
    dutyShiftId: null,
    karkunType: ['volunteers', 'employees'],
  };

  setPageParams = (pageParams: Partial<ListContainerState>) => {
    this.setState(pageParams as any);
  };

  render() {
    const { predefinedFilterName, predefinedFilterStoreId, setSelectedValue } = this.props;
    const {
      pageIndex,
      pageSize,
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      jobId,
      dutyId,
      dutyShiftId,
      karkunType,
    } = this.state;

    const showVolunteers =
      karkunType.indexOf('volunteers') !== -1 ? 'true' : 'false';
    const showEmployees =
      karkunType.indexOf('employees') !== -1 ? 'true' : 'false';

    return (
      <KarkunList
        pageIndex={pageIndex}
        pageSize={pageSize}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        bloodGroup={bloodGroup}
        jobId={jobId}
        dutyId={dutyId}
        dutyShiftId={dutyShiftId}
        showVolunteers={showVolunteers}
        showEmployees={showEmployees}
        setPageParams={this.setPageParams}
        handleItemSelected={setSelectedValue}
        showPhoneNumbersColumn={false}
        showDutiesColumn
        showActionsColumn={false}
        predefinedFilterName={predefinedFilterName}
        predefinedFilterStoreId={predefinedFilterStoreId}
      />
    );
  }
}
