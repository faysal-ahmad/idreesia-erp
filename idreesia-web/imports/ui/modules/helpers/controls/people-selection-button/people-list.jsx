import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { PeopleList, PeopleListFilter } from '/imports/ui/modules/common';

import { PAGED_PEOPLE } from './gql';

const List = ({ handleSelectItem }) => {
  const [name, setName] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const setPageParams = values => {
    if (values.hasOwnProperty('name')) setName(values.name);
    if (values.hasOwnProperty('cnicNumber')) setCnicNumber(values.cnicNumber);
    if (values.hasOwnProperty('phoneNumber'))
      setPhoneNumber(values.phoneNumber);
    if (values.hasOwnProperty('city')) setCity(values.city);
    if (values.hasOwnProperty('pageIndex')) setPageIndex(values.pageIndex);
    if (values.hasOwnProperty('pageSize')) setPageSize(values.pageSize);
  };

  const { data, loading, refetch } = useQuery(PAGED_PEOPLE, {
    variables: {
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        city,
        pageIndex,
        pageSize,
      },
    },
  });

  if (loading) return null;
  const { pagedPeople } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => (
    <PeopleListFilter
      name={name}
      cnicNumber={cnicNumber}
      phoneNumber={phoneNumber}
      city={city}
      setPageParams={setPageParams}
      refreshData={refetch}
    />
  );

  const getTableHeader = () => (
    <div className="list-table-header">{getListFilter()}</div>
  );

  return (
    <PeopleList
      showCategoryColumn
      showCnicColumn
      showPhoneNumbersColumn
      showCityCountryColumn
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
