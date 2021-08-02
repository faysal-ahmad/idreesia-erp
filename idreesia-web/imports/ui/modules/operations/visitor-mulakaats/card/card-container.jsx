import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import ReactToPrint from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';

import { Button } from '/imports/ui/controls';
import { VisitorMulakaatCard } from '/imports/ui/modules/common';

import {
  OPERATIONS_VISITOR_MULAKAAT_BY_ID,
  PAGED_OPERATIONS_VISITOR_MULAKAATS,
} from '../gql';

const MulakaatCardContainer = ({
  visitorId,
  visitorMulakaatId,
  onCloseCard,
}) => {
  const cardRef = useRef();
  const {
    data: operationsVisitorMulakaatByIdData,
    loading: operationsVisitorMulakaatByIdLoading,
  } = useQuery(OPERATIONS_VISITOR_MULAKAAT_BY_ID, {
    variables: { _id: visitorMulakaatId },
  });
  const {
    data: pagedOperationsVisitorMulakaatsData,
    loading: pagedOperationsVisitorMulakaatsLoading,
  } = useQuery(PAGED_OPERATIONS_VISITOR_MULAKAATS, {
    variables: {
      filter: {
        visitorId,
        pageIndex: '0',
        pageSize: '6',
      },
    },
  });

  if (
    operationsVisitorMulakaatByIdLoading ||
    pagedOperationsVisitorMulakaatsLoading
  ) {
    return null;
  }

  const { operationsVisitorMulakaatById } = operationsVisitorMulakaatByIdData;
  const {
    pagedOperationsVisitorMulakaats,
  } = pagedOperationsVisitorMulakaatsData;
  return (
    <>
      <VisitorMulakaatCard
        ref={cardRef}
        visitorMulakaat={operationsVisitorMulakaatById}
        visitorMulakaatHistory={pagedOperationsVisitorMulakaats.data}
      />
      <div style={{ paddingTop: '5px' }}>
        <ReactToPrint
          trigger={() => (
            <Button type="primary" size="large">
              <PrinterOutlined />
              Print
            </Button>
          )}
          content={() => cardRef.current}
        />
        &nbsp;
        <Button size="large" type="default" onClick={() => onCloseCard()}>
          Close
        </Button>
      </div>
    </>
  );
};

MulakaatCardContainer.propTypes = {
  visitorId: PropTypes.string,
  visitorMulakaatId: PropTypes.string,
  onCloseCard: PropTypes.func,
};

export default MulakaatCardContainer;
