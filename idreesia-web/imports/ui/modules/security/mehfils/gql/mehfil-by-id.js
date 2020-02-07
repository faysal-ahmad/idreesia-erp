import gql from 'graphql-tag';

const MEHFIL_BY_ID = gql`
  query mehfilById($_id: String!) {
    mehfilById(_id: $_id) {
      _id
      name
      mehfilDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default MEHFIL_BY_ID;
