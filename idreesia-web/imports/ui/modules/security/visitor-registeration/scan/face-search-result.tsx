import React from 'react';
import { useQuery } from '@apollo/client/react';

import ResultGrid from './result-grid';
import { SECURITY_VISITORS_BY_FACE_VECTOR } from '../gql';

const MATCH_LIMIT = 5;

interface FaceSearchResultProps {
  vector: number[];
}

// Deliberately does no image-quality handling: every unusable-photo case was already caught and
// explained inside the capture dialog, so a vector only reaches this component once it is good.
const FaceSearchResult = ({ vector }: FaceSearchResultProps) => {
  const { data, loading } = useQuery(SECURITY_VISITORS_BY_FACE_VECTOR, {
    variables: { vector, limit: MATCH_LIMIT },
    fetchPolicy: 'no-cache',
  });

  if (vector.length === 0) return null;

  // Already ordered best-first by the server; the score is not surfaced, the ordering carries it.
  const matches = data?.securityVisitorsByFaceVector ?? [];
  const people = matches.flatMap(match => (match?.person ? [match.person] : []));

  return (
    <ResultGrid
      loading={loading}
      people={people}
      emptyMessage="No matching registration found for this photo."
    />
  );
};

export default FaceSearchResult;
