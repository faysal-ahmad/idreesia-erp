import React from 'react';
import { useQuery } from '@apollo/client/react';

import ResultGrid from './result-grid';
import { SECURITY_VISITOR_BY_CNIC } from '../gql';

interface SearchResultProps {
  cnicNumbers: string[];
}

// The CNIC lookup returns at most one person, so this renders zero or one card into the same grid
// the face search uses.
const SearchResult = ({ cnicNumbers }: SearchResultProps) => {
  const { data, loading } = useQuery(SECURITY_VISITOR_BY_CNIC, {
    variables: { cnicNumbers },
    fetchPolicy: 'network-only',
  });

  if (cnicNumbers.length === 0) return null;

  const securityVisitorByCnic = data?.securityVisitorByCnic;

  return (
    <ResultGrid
      loading={loading}
      people={securityVisitorByCnic ? [securityVisitorByCnic] : []}
      emptyMessage="No records found against scanned CNIC."
    />
  );
};

export default SearchResult;
