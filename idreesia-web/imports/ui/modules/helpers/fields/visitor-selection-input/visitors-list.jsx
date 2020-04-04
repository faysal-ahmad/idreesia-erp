import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { VisitorsList, VisitorsListFilter } from '/imports/ui/modules/common';

import { PAGED_VISITORS } from './gql';

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

  const { data, loading, refetch } = useQuery(PAGED_VISITORS, {
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
  const { pagedVisitors } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getListFilter = () => (
    <VisitorsListFilter
      showAdditionalInfoFilter={false}
      showDataSourceFilter={false}
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
    <VisitorsList
      showStatusColumn
      showCnicColumn
      showPhoneNumbersColumn
      showCityCountryColumn
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
