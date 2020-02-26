import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useAllMSDuties } from 'meteor/idreesia-common/hooks/hr';
import { KarkunsList, KarkunsListFilter } from '/imports/ui/modules/common';

import { PAGED_MS_KARKUNS } from './gql';

const List = ({ handleSelectItem }) => {
  const [name, setName] = useState(null);
  const [cnicNumber, setCnicNumber] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const setPageParams = values => {
    if (values.hasOwnProperty('name')) setName(values.name);
    if (values.hasOwnProperty('cnicNumber')) setCnicNumber(values.cnicNumber);
    if (values.hasOwnProperty('phoneNumber'))
      setPhoneNumber(values.phoneNumber);
    if (values.hasOwnProperty('pageIndex')) setPageIndex(values.pageIndex);
    if (values.hasOwnProperty('pageSize')) setPageSize(values.pageSize);
  };

  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { data, loading, refetch } = useQuery(PAGED_MS_KARKUNS, {
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
  const { pagedKarkuns } = data;
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
      pagedData={pagedKarkuns}
    />
  );
};

List.propTypes = {
  handleSelectItem: PropTypes.func,
};

export default List;
