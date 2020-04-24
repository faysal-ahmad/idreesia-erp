import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { KarkunsList } from '/imports/ui/modules/common';

import { PAGED_MS_KARKUN_MESSAGE_RECEPIENTS } from './gql';

const KarkunsPreview = ({ recepientFilter }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { data, loading } = recepientFilter
    ? useQuery(PAGED_MS_KARKUN_MESSAGE_RECEPIENTS, {
        variables: {
          recepientFilter,
        },
      })
    : {
        data: {
          pagedMSKarkunMessageRecepients: { karkuns: [], totalResults: 0 },
        },
        loading: false,
      };

  useEffect(() => {
    setPageIndex(0);
  }, [recepientFilter]);

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
      pagedData={data.pagedMSKarkunMessageRecepients}
      setPageParams={setPageParams}
    />
  );
};

KarkunsPreview.propTypes = {
  recepientFilter: PropTypes.object,
};

export default KarkunsPreview;
