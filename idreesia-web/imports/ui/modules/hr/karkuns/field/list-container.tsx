import React, { Component } from 'react';

import List from '../list/list';
import type { PageParams } from '../list/list-filter';

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
  dutyId: string | null;
  dutyShiftId: string | null;
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
    dutyId: null,
    dutyShiftId: null,
  };

  setPageParams = (pageParams: Partial<ListContainerState>) => {
    this.setState(prevState => ({
      ...prevState,
      ...pageParams,
    }));
  };

  render() {
    const { predefinedFilterName, predefinedFilterStoreId, setSelectedValue } =
      this.props;
    const {
      pageIndex,
      pageSize,
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      dutyId,
      dutyShiftId,
    } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        name={name ?? undefined}
        cnicNumber={cnicNumber ?? undefined}
        phoneNumber={phoneNumber ?? undefined}
        bloodGroup={bloodGroup ?? undefined}
        dutyId={dutyId ?? undefined}
        dutyShiftId={dutyShiftId ?? undefined}
        setPageParams={this.setPageParams as (params: PageParams) => void}
        handleItemSelected={
          setSelectedValue
            ? record =>
                setSelectedValue({
                  _id: record._id ?? undefined,
                  name: record.sharedData?.name ?? undefined,
                })
            : undefined
        }
        showPhoneNumbersColumn={false}
        showDutiesColumn
        showActionsColumn={false}
        predefinedFilterName={predefinedFilterName}
        predefinedFilterStoreId={predefinedFilterStoreId}
      />
    );
  }
}
