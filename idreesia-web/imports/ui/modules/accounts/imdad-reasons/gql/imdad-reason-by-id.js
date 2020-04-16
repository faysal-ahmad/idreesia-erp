import gql from 'graphql-tag';

const IMDAD_REASON_BY_ID = gql`
  query imdadReasonById($_id: String!) {
    imdadReasonById(_id: $_id) {
      _id
      name
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default IMDAD_REASON_BY_ID;
