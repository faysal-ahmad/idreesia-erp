import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { VisitorsList, VisitorsListFilter } from '/imports/ui/modules/common';

import { PAGED_VISITORS } from './gql';

const List = ({ handleSelectItem }) => {
  const [name, setName] = useState(null);
  const [cnicNumber, setCnicNumber] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [city, setCity] = useState(null);
  const [ehadDuration, setEhadDuration] = useState(null);
  const [updatedBetween, setUpdatedBetween] = useState(null);
  const [pageIndex, setPageIndex] = useState('0');
  const [pageSize, setPageSize] = useState('20');

  const { distinctCities, distinctCitiesRefetch } = useDistinctCities(
    'cache-first'
  );

  const setPageParams = values => {
    if (values.hasOwnProperty('name')) setName(values.name);
    if (values.hasOwnProperty('cnicNumber')) setCnicNumber(values.cnicNumber);
    if (values.hasOwnProperty('phoneNumber'))
      setPhoneNumber(values.phoneNumber);
    if (values.hasOwnProperty('city')) setCity(values.city);
    if (values.hasOwnProperty('ehadDuration'))
      setEhadDuration(values.ehadDuration);
    if (values.hasOwnProperty('updatedBetween'))
      setUpdatedBetween(values.updatedBetween);
    if (values.hasOwnProperty('pageIndex'))
      setPageIndex(values.pageIndex.toString());
    if (values.hasOwnProperty('pageSize'))
      setPageSize(values.pageSize.toString());
  };

  const { data, loading, refetch } = useQuery(PAGED_VISITORS, {
    variables: {
      filter: {
        name,
        cnicNumber,
        phoneNumber,
        city,
        ehadDuration,
        updatedBetween,
        pageIndex,
        pageSize,
      },
    },
  });

  if (loading) return null;
  const { pagedVisitors } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const refreshData = () => {
    refetch();
    distinctCitiesRefetch();
  };

  const getListFilter = () => (
    <VisitorsListFilter
      name={name}
      cnicNumber={cnicNumber}
      phoneNumber={phoneNumber}
      city={city}
      ehadDuration={ehadDuration}
      updatedBetween={updatedBetween}
      distinctCities={distinctCities || []}
      setPageParams={setPageParams}
      refreshData={refreshData}
    />
  );

  const getTableHeader = () => (
    <div className="list-table-header">{getListFilter()}</div>
  );

  return (
    <VisitorsList
      showSelectionColumn={false}
      showCnicColumn
      showPhoneNumbersColumn
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedVisitors}
    />
  );
};

List.propTypes = {
  handleSelectItem: PropTypes.func,
};

export default List;
