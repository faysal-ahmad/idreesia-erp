import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import ReactToPrint from 'react-to-print';
import { PrinterOutlined } from '@ant-design/icons';

import { Button } from '/imports/ui/controls';
import { VisitorMulakaatCard } from '/imports/ui/modules/common';

import {
  SECURITY_VISITOR_MULAKAAT_BY_ID,
  PAGED_SECURITY_VISITOR_MULAKAATS,
} from '../gql';

const MulakaatCardContainer = ({
  visitorId,
  visitorMulakaatId,
  onCloseCard,
}) => {
  const cardRef = useRef();

  const {
    data: securityVisitorMulakaatByIdData,
    loading: securityVisitorMulakaatByIdLoading,
  } = useQuery(SECURITY_VISITOR_MULAKAAT_BY_ID, {
    variables: { _id: visitorMulakaatId },
  });

  const {
    data: pagedSecurityVisitorMulakaatsData,
    loading: pagedSecurityVisitorMulakaatsLoading,
  } = useQuery(PAGED_SECURITY_VISITOR_MULAKAATS, {
    variables: {
      filter: {
        visitorId,
        pageIndex: '0',
        pageSize: '6',
      },
    },
  });

  if (
    securityVisitorMulakaatByIdLoading ||
    pagedSecurityVisitorMulakaatsLoading
  ) {
    return null;
  }

  const { securityVisitorMulakaatById } = securityVisitorMulakaatByIdData;
  const { pagedSecurityVisitorMulakaats } = pagedSecurityVisitorMulakaatsData;
  return (
    <>
      <VisitorMulakaatCard
        ref={cardRef}
        visitorMulakaat={securityVisitorMulakaatById}
        visitorMulakaatHistory={pagedSecurityVisitorMulakaats.data}
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
