import gql from 'graphql-tag';

const APPROVE_SALARIES = gql`
  mutation approveSalaries($month: String!, $ids: [String]!) {
    approveSalaries(month: $month, ids: $ids)
  }
`;

export default APPROVE_SALARIES;
