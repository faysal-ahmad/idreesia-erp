import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { KarkunsList } from '/imports/ui/modules/common';

import { PAGED_KARKUNS } from '../karkuns/gql';

const KarkunsPreview = ({ filter }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { data, loading } = filter
    ? useQuery(PAGED_KARKUNS, {
        variables: {
          filter,
        },
      })
    : {
        data: {
          pagedKarkuns: { karkuns: [], totalResults: 0 },
        },
        loading: false,
      };

  useEffect(() => {
    setPageIndex(0);
  }, [filter]);

  const setPageParams = params => {
    if (params.pageSize) setPageSize(params.pageSize);
    if (params.pageIndex) setPageIndex(params.pageIndex);
  };

  if (loading) return null;

  return (
    <KarkunsList
      showSelectionColumn={false}
      showCnicColumn={false}
      showPhoneNumbersColumn
      showMehfilCityColumn
      showDutiesColumn
      showDeleteAction={false}
      pageIndex={pageIndex}
      pageSize={pageSize}
      pagedData={data.pagedKarkuns}
      setPageParams={setPageParams}
    />
  );
};

KarkunsPreview.propTypes = {
  filter: PropTypes.object,
};

export default KarkunsPreview;