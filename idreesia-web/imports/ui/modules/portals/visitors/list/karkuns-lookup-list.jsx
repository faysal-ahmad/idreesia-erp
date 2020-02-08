import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { Button } from '/imports/ui/controls';
import { PersonName, KarkunsList } from '/imports/ui/modules/helpers/controls';

import { PORTAL_KARKUNS_BY_VISITOR } from '../gql';

const KarkunsLookupList = ({
  portalId,
  visitor,
  handleKarkunSelected,
  handleCreateKarkunClicked,
}) => {
  const { data, loading, refetch } = useQuery(PORTAL_KARKUNS_BY_VISITOR, {
    variables: {
      portalId,
      visitorName: visitor.name,
      visitorPhone: visitor.contactNumber1,
      visitorCnic: visitor.cnicNumber,
    },
  });

  if (loading) return null;
  const { portalKarkunsByVisitor } = data;

  const getTableHeader = () => (
    <div className="list-table-header">
      <PersonName person={visitor} />
      <Button
        type="primary"
        icon="plus-circle-o"
        size="large"
        onClick={() => {
          handleCreateKarkunClicked(refetch);
        }}
      >
        Create Karkun
      </Button>
    </div>
  );

  return (
    <KarkunsList
      showSelectionColumn={false}
      showCnicColumn
      showPhoneNumbersColumn
      showDeleteAction={false}
      listHeader={getTableHeader}
      handleSelectItem={handleKarkunSelected}
      pageIndex={0}
      pageSize={20}
      pagedData={portalKarkunsByVisitor}
    />
  );
};

KarkunsLookupList.propTypes = {
  portalId: PropTypes.string,
  visitor: PropTypes.object,
  handleKarkunSelected: PropTypes.func,
  handleCreateKarkunClicked: PropTypes.func,
};

export default KarkunsLookupList;
