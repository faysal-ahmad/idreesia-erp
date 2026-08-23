import gql from 'graphql-tag';

export default gql`
type FaceVectorRecord {
  personId: String!
  vector: [Float!]!
  computedAt: DateTime!
}

type Query {
  faceVectors(since: DateTime, limit: Int): [FaceVectorRecord!]!
}
`;
