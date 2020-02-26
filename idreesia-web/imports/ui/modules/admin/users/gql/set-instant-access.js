import gql from 'graphql-tag';

const SET_INSTANCE_ACCESS = gql`
  mutation setInstanceAccess($userId: String!, $instances: [String]!) {
    setInstanceAccess(userId: $userId, instances: $instances) {
      _id
      instances
    }
  }
`;

export default SET_INSTANCE_ACCESS;
