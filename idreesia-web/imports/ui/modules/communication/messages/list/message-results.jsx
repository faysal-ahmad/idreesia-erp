import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { KarkunsList } from '/imports/ui/modules/common';

import { PAGED_MS_KARKUN_MESSAGE_RECEPIENTS_BY_RESULT } from '../gql';

const MessageResults = ({ messageId, succeeded }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { data, loading } = messageId
    ? useQuery(PAGED_MS_KARKUN_MESSAGE_RECEPIENTS_BY_RESULT, {
        variables: {
          recepientsByResultFilter: {
            _id: messageId,
            succeeded,
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
          },
        },
      })
    : {
        data: {
          pagedMSKarkunMessageRecepientsByResult: {
            karkuns: [],
            totalResults: 0,
          },
        },
        loading: false,
      };

  useEffect(() => {
    setPageIndex(0);
  }, [messageId]);

  const setPageParams = params => {
    if (params.pageSize) setPageSize(params.pageSize);
    if (params.pageIndex) setPageIndex(params.pageIndex);
  };

  if (loading) return null;
  debugger;

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
      pagedData={data.pagedMSKarkunMessageRecepientsByResult}
      setPageParams={setPageParams}
    />
  );
};

MessageResults.propTypes = {
  messageId: PropTypes.string,
  succeeded: PropTypes.bool,
};

export default MessageResults;
