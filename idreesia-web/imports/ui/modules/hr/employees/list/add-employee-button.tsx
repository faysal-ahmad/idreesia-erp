import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Drawer } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import type { HrPeoplePagedHrKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';

import { SET_HR_KARKUN_EMPLOYMENT_INFO } from '../gql';
import List from './list';
import { type PageParams } from './list-filter';

type HrKarkunRow = NonNullable<
  NonNullable<
    NonNullable<HrPeoplePagedHrKarkunsQuery['pagedHrKarkuns']>['data']
  >[number]
>;

interface FilterState {
  pageIndex: number;
  pageSize: number;
  name: string | null;
  cnicNumber: string | null;
  phoneNumber: string | null;
  bloodGroup: string | null;
}

const AddEmployeeButton = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    pageIndex: 0,
    pageSize: 20,
    name: null,
    cnicNumber: null,
    phoneNumber: null,
    bloodGroup: null,
  });
  const [setHrKarkunEmploymentInfo] = useMutation(
    SET_HR_KARKUN_EMPLOYMENT_INFO,
    {
      refetchQueries: ['hrPeoplePagedHrKarkuns'],
    }
  );

  const setPageParams = (params: Partial<FilterState>) => {
    setFilterState(prevState => ({
      ...prevState,
      ...params,
    }));
  };

  const handleItemSelected = (record: HrKarkunRow) => {
    if (!record._id) return;

    setHrKarkunEmploymentInfo({
      variables: {
        _id: record._id,
        isEmployee: true,
        employmentStartDate: new Date().toISOString(),
        employmentEndDate: null,
        jobId: null,
      },
    })
      .then(() => {
        setShowDrawer(false);
        message.success('Employee added', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const { pageIndex, pageSize, name, cnicNumber, phoneNumber, bloodGroup } =
    filterState;

  return (
    <>
      <Drawer
        title="Add Employee"
        size={720}
        onClose={() => setShowDrawer(false)}
        open={showDrawer}
      >
        <List
          mode="candidates"
          pageIndex={pageIndex}
          pageSize={pageSize}
          name={name ?? undefined}
          cnicNumber={cnicNumber ?? undefined}
          phoneNumber={phoneNumber ?? undefined}
          bloodGroup={bloodGroup ?? undefined}
          setPageParams={setPageParams as (params: PageParams) => void}
          handleItemSelected={handleItemSelected}
          showPhoneNumbersColumn
          showActionsColumn={false}
        />
      </Drawer>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => setShowDrawer(true)}
      >
        Add Employee
      </Button>
    </>
  );
};

export default AddEmployeeButton;
