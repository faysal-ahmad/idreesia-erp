import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import List from './list';

const PAGED_OPERATIONS_WAZAIF = gql`
  query pagedOperationsWazaif($filter: WazaifFilter) {
    pagedOperationsWazaif(filter: $filter) {
      totalResults
      data {
        _id
        name
        formattedName,
        revisionNumber
        revisionDate
        imageIds
        wazeefaDetail {
          packetCount
          subCartonCount
          cartonCount
        }
        images {
          _id
          name
        }
      }
    }
  }
`;

const ListContainer = ({ setSelectedValue }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, loading } = useQuery(PAGED_OPERATIONS_WAZAIF, {
    variables: { filter: {
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
      },
    },
  });

  const setPageParams = params => {
    setPageSize(params.pageSize);
    setPageIndex(params.pageIndex);
  };

  if (loading) return null;

  return (
    <List
      pageIndex={pageIndex}
      pageSize={pageSize}
      pagedData={data.pagedOperationsWazaif}
      setPageParams={setPageParams}
      handleSelectItem={setSelectedValue}
    />
  );
}

ListContainer.propTypes = {
  setSelectedValue: PropTypes.func,
};

export default ListContainer;