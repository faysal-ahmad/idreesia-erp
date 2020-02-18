import gql from 'graphql-tag';

const UPDATE_LAST_ACTIVE_TIME = gql`
  mutation updateLastActiveTime {
    updateLastActiveTime
  }
`;

export default UPDATE_LAST_ACTIVE_TIME;
