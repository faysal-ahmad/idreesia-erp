import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { PeopleList, PeopleListFilter } from '/imports/ui/modules/common';

import { PAGED_PEOPLE } from './gql';

const DataList = PeopleList as any;
const DataListFilter = PeopleListFilter as any;
type AnyRecord = Record<string, any>;
interface Props { handleSelectItem?(item: AnyRecord): void; }
interface QueryData { pagedPeople?: unknown; }

const List = ({ handleSelectItem }: Props) => {
  const [name, setName] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const setPageParams = (values: AnyRecord) => {
    if (Object.prototype.hasOwnProperty.call(values, 'name')) setName(values.name);
    if (Object.prototype.hasOwnProperty.call(values, 'cnicNumber')) setCnicNumber(values.cnicNumber);
    if (Object.prototype.hasOwnProperty.call(values, 'phoneNumber'))
      setPhoneNumber(values.phoneNumber);
    if (Object.prototype.hasOwnProperty.call(values, 'city')) setCity(values.city);
    if (Object.prototype.hasOwnProperty.call(values, 'pageIndex')) setPageIndex(values.pageIndex);
    if (Object.prototype.hasOwnProperty.call(values, 'pageSize')) setPageSize(values.pageSize);
  };

  const { data, loading, refetch } = useQuery(PAGED_PEOPLE as any, {
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
  const { pagedPeople } = (data ?? {}) as QueryData;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => (
    <DataListFilter
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
    <DataList
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
