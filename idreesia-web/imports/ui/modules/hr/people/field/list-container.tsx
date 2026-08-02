import React, { Component } from 'react';

import List from '../list/list';
import { type PageParams } from '../list/list-filter';

interface SelectionValue {
  _id?: string;
  name?: string;
  sharedData?: { name?: string };
}

interface ListContainerProps {
  setSelectedValue?(value: SelectionValue): void;
  predefinedFilterName?: string;
  predefinedFilterStoreId?: string;
}

interface ListContainerState {
  pageIndex: number;
  pageSize: number;
  name: string | null;
  cnicNumber: string | null;
  phoneNumber: string | null;
  bloodGroup: string | null;
  jobId: string | null;
  dutyId: string | null;
  dutyShiftId: string | null;
  karkunType: string[];
}

export default class ListContainer extends Component<
  ListContainerProps,
  ListContainerState
> {
  state: ListContainerState = {
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
    this.setState(prevState => ({
      ...prevState,
      ...pageParams,
    }));
  };

  render() {
    const { predefinedFilterName, setSelectedValue } = this.props;
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
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        name={name ?? undefined}
        cnicNumber={cnicNumber ?? undefined}
        phoneNumber={phoneNumber ?? undefined}
        bloodGroup={bloodGroup ?? undefined}
        jobId={jobId ?? undefined}
        dutyId={dutyId ?? undefined}
        dutyShiftId={dutyShiftId ?? undefined}
        showVolunteers={showVolunteers}
        showEmployees={showEmployees}
        setPageParams={this.setPageParams as (params: PageParams) => void}
        handleItemSelected={
          setSelectedValue
            ? record =>
                setSelectedValue({
                  _id: record._id ?? undefined,
                  name: record.name ?? undefined,
                })
            : undefined
        }
        showPhoneNumbersColumn={false}
        showDutiesColumn
        showActionsColumn={false}
        predefinedFilterName={predefinedFilterName}
      />
    );
  }
}
