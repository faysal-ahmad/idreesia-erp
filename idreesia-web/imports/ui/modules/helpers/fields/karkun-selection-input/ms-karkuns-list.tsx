import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useAllMSDuties } from 'meteor/idreesia-common/hooks/hr';
import { KarkunsList, KarkunsListFilter } from '/imports/ui/modules/common';

import { PAGED_HR_KARKUNS } from './gql';

const DataList = KarkunsList as any;
const DataListFilter = KarkunsListFilter as any;
type AnyRecord = Record<string, any>;
interface Props { handleSelectItem?(item: AnyRecord): void; }
interface QueryData { pagedHrKarkuns?: unknown; }

const List = ({ handleSelectItem }: Props) => {
  const [name, setName] = useState<string | null>(null);
  const [cnicNumber, setCnicNumber] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const setPageParams = (values: AnyRecord) => {
    if (Object.prototype.hasOwnProperty.call(values, 'name')) setName(values.name);
    if (Object.prototype.hasOwnProperty.call(values, 'cnicNumber')) setCnicNumber(values.cnicNumber);
    if (Object.prototype.hasOwnProperty.call(values, 'phoneNumber'))
      setPhoneNumber(values.phoneNumber);
    if (Object.prototype.hasOwnProperty.call(values, 'pageIndex')) setPageIndex(values.pageIndex);
    if (Object.prototype.hasOwnProperty.call(values, 'pageSize')) setPageSize(values.pageSize);
  };

  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { data, loading, refetch } = useQuery(PAGED_HR_KARKUNS as any, {
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
  const { pagedHrKarkuns } = (data ?? {}) as QueryData;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => {
    if (allMSDutiesLoading) {
      return null;
    }

    return (
      <DataListFilter
        showBloodGroupFilter={false}
        showAttendanceFilter={false}
        showLastTarteebFilter={false}
        showMehfilDutyFilter={false}
        showCityMehfilFilter={false}
        showRegionFilter={false}
        mehfilDuties={allMSDuties}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    );
  };

  const getTableHeader = () => (
    <div className="list-table-header">{getListFilter()}</div>
  );

  return (
    <DataList
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
      pagedData={pagedHrKarkuns}
    />
  );
};

List.propTypes = {
  handleSelectItem: PropTypes.func,
};

export default List;
