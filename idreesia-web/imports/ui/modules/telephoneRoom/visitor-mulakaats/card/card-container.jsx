import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import ReactToPrint from 'react-to-print';

import { Button, Icon } from '/imports/ui/controls';
import { VisitorMulakaatCard } from '/imports/ui/modules/common';

import {
  TELEPHONE_ROOM_VISITOR_MULAKAAT_BY_ID,
  PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS,
} from '../gql';

const MulakaatCardContainer = ({
  visitorId,
  visitorMulakaatId,
  onCloseCard,
}) => {
  const cardRef = useRef();
  const {
    data: { telephoneRoomVisitorMulakaatById },
    loading: telephoneRoomVisitorMulakaatByIdLoading,
  } = useQuery(TELEPHONE_ROOM_VISITOR_MULAKAAT_BY_ID, {
    variables: { _id: visitorMulakaatId },
  });
  const {
    data: { pagedTelephoneRoomVisitorMulakaats },
    loading: pagedTelephoneRoomVisitorMulakaatsLoading,
  } = useQuery(PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS, {
    variables: {
      filter: {
        visitorId,
        pageIndex: '0',
        pageSize: '6',
      },
    },
  });

  if (
    telephoneRoomVisitorMulakaatByIdLoading ||
    pagedTelephoneRoomVisitorMulakaatsLoading
  ) {
    return null;
  }

  return (
    <>
      <VisitorMulakaatCard
        ref={cardRef}
        visitorMulakaat={telephoneRoomVisitorMulakaatById}
        visitorMulakaatHistory={pagedTelephoneRoomVisitorMulakaats.data}
      />
      <div style={{ paddingTop: '5px' }}>
        <ReactToPrint
          trigger={() => (
            <Button type="primary" size="large">
              <Icon type="printer" />
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
