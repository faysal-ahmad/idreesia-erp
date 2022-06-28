import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { PeopleList, PeopleListFilter } from '/imports/ui/modules/common';

import { PAGED_PEOPLE } from './gql';

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

  const { data, loading, refetch } = useQuery(PAGED_PEOPLE, {
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
  const { pagedPeople } = data;
  debugger;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => (
    <PeopleListFilter
      showBloodGroupFilter={false}
      showAttendanceFilter={false}
      showLastTarteebFilter={false}
      showMehfilDutyFilter={false}
      showCityMehfilFilter={false}
      showRegionFilter={false}
      name={name}
      cnicNumber={cnicNumber}
      phoneNumber={phoneNumber}
      setPageParams={setPageParams}
      refreshData={refetch}
    />
  );

  const getTableHeader = () => (
    <div className="list-table-header">{getListFilter()}</div>
  );

  return (
    <PeopleList
      showSelectionColumn={false}
      showCategoryColumn
      showCnicColumn
      showPhoneNumbersColumn
      showCityCountryColumn
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedPeople}
    />
  );
};

List.propTypes = {
  handleSelectItem: PropTypes.func,
};

export default List;
