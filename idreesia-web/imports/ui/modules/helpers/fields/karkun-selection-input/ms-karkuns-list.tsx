import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import type { HelperPagedHrKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import { useAllMSDuties } from '/imports/ui/modules/hr/common/hooks';
import { KarkunsList, KarkunsListFilter } from '/imports/ui/modules/common';

import { PAGED_HR_KARKUNS } from './gql';

type HrKarkunRow = NonNullable<
  NonNullable<
    NonNullable<HelperPagedHrKarkunsQuery['pagedHrKarkuns']>['data']
  >[number]
>;

interface PageParams {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  pageIndex?: string;
  pageSize?: string;
}

interface Props {
  handleSelectItem?(item: HrKarkunRow): void;
}

const List = ({ handleSelectItem }: Props) => {
  const [name, setName] = useState<string | null>(null);
  const [cnicNumber, setCnicNumber] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const setPageParams = (values: PageParams) => {
    if (Object.prototype.hasOwnProperty.call(values, 'name')) setName(values.name ?? null);
    if (Object.prototype.hasOwnProperty.call(values, 'cnicNumber')) setCnicNumber(values.cnicNumber ?? null);
    if (Object.prototype.hasOwnProperty.call(values, 'phoneNumber'))
      setPhoneNumber(values.phoneNumber ?? null);
    if (Object.prototype.hasOwnProperty.call(values, 'pageIndex')) setPageIndex(values.pageIndex ?? '0');
    if (Object.prototype.hasOwnProperty.call(values, 'pageSize')) setPageSize(values.pageSize ?? '20');
  };

  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { data, loading, refetch } = useQuery(PAGED_HR_KARKUNS, {
    variables: {
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        pageIndex,
        pageSize,
      },
    },
  });

  if (loading) return null;
  const pagedHrKarkuns = data?.pagedHrKarkuns;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => {
    if (allMSDutiesLoading) {
      return null;
    }

    return (
      <KarkunsListFilter
        showBloodGroupFilter={false}
        showAttendanceFilter={false}
        showLastTarteebFilter={false}
        showMehfilDutyFilter={false}
        showCityMehfilFilter={false}
        showRegionFilter={false}
        mehfilDuties={(allMSDuties ?? []).filter((item) => item != null)}
        name={name ?? undefined}
        cnicNumber={cnicNumber ?? undefined}
        phoneNumber={phoneNumber ?? undefined}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    );
  };

  const getTableHeader = () => (
    <div className="list-table-header">{getListFilter()}</div>
  );

  return (
    <KarkunsList
      showSelectionColumn={false}
      showCnicColumn
      showPhoneNumbersColumn
      showMehfilCityColumn={false}
      showDutiesColumn
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedHrKarkuns ?? undefined}
    />
  );
};

export default List;
