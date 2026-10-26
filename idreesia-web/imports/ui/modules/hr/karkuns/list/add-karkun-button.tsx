import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Drawer } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import type { HrKarkunsPagedHrKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';

import { PROMOTE_HR_KARKUN } from '../gql';
import List from './list';
import { type PageParams } from './list-filter';

type KarkunRow = NonNullable<
  NonNullable<
    NonNullable<HrKarkunsPagedHrKarkunsQuery['pagedHrKarkuns']>['data']
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

const AddKarkunButton = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    pageIndex: 0,
    pageSize: 20,
    name: null,
    cnicNumber: null,
    phoneNumber: null,
    bloodGroup: null,
  });
  const [promoteHrKarkun] = useMutation(PROMOTE_HR_KARKUN, {
    refetchQueries: ['hrKarkunsPagedHrKarkuns'],
  });

  const setPageParams = (params: Partial<FilterState>) => {
    setFilterState(prevState => ({
      ...prevState,
      ...params,
    }));
  };

  const handleItemSelected = (record: KarkunRow) => {
    if (!record._id) return;

    promoteHrKarkun({
      variables: {
        _id: record._id,
      },
    })
      .then(() => {
        setShowDrawer(false);
        message.success('Karkun added', 2);
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
        title="Add Karkun"
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
        Add Karkun
      </Button>
    </>
  );
};

export default AddKarkunButton;
