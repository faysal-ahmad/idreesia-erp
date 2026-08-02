import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import type { PagedPeopleQuery } from 'meteor/idreesia-common/types/client-operations';
import { PeopleList, PeopleListFilter } from '/imports/ui/modules/common';

import { PAGED_PEOPLE } from './gql';

type PersonRow = NonNullable<
  NonNullable<NonNullable<PagedPeopleQuery['pagedPeople']>['data']>[number]
>;

interface PageParams {
  pageIndex: string;
  pageSize: string;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
}

interface Props {
  handleSelectItem?(item: PersonRow): void;
}

const List = ({ handleSelectItem }: Props) => {
  const [name, setName] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const setPageParams = (values: Partial<PageParams>) => {
    if (Object.prototype.hasOwnProperty.call(values, 'name')) setName(values.name ?? '');
    if (Object.prototype.hasOwnProperty.call(values, 'cnicNumber')) setCnicNumber(values.cnicNumber ?? '');
    if (Object.prototype.hasOwnProperty.call(values, 'phoneNumber'))
      setPhoneNumber(values.phoneNumber ?? '');
    if (Object.prototype.hasOwnProperty.call(values, 'city')) setCity(values.city ?? '');
    if (Object.prototype.hasOwnProperty.call(values, 'pageIndex')) setPageIndex(values.pageIndex ?? '0');
    if (Object.prototype.hasOwnProperty.call(values, 'pageSize')) setPageSize(values.pageSize ?? '20');
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
  const { pagedPeople } = data ?? {};
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
      pagedData={pagedPeople ?? undefined}
    />
  );
};

export default List;
