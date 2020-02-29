import gql from 'graphql-tag';

const DELETE_OUTSTATION_MEMBER = gql`
  mutation deleteOustationMember($_id: String!) {
    deleteOustationMember(_id: $_id)
  }
`;

export default DELETE_OUTSTATION_MEMBER;
