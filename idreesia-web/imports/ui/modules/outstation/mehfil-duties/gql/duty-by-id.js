import gql from 'graphql-tag';

const DUTY_BY_ID = gql`
  query dutyById($id: String!) {
    dutyById(id: $id) {
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

export default DUTY_BY_ID;
