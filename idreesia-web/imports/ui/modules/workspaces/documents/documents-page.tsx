import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useApolloClient } from '@apollo/client/react';

import { DocumentLibrary } from '/imports/ui/modules/common/documents';

import { useMyCommittees } from '../hooks/use-my-committees';
import CommitteeDocumentsProvider from './committee-documents-provider';

// A committee's documents, using the reusable document library UI with a
// committee data provider.
const DocumentsPage = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const client = useApolloClient();
  const { committees } = useMyCommittees();
  const committee = committees.find(row => row._id === committeeId);

  const provider = useMemo(
    () => new CommitteeDocumentsProvider(client, committeeId),
    [client, committeeId]
  );

  return (
    <DocumentLibrary
      key={committeeId}
      provider={provider}
      rootName={committee?.name ? `${committee.name} Documents` : 'Documents'}
    />
  );
};

export default DocumentsPage;
