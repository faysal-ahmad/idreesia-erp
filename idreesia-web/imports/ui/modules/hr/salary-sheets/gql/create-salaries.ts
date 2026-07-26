import gql from 'graphql-tag';

const CREATE_SALARIES = gql`
  mutation createSalaries($month: String!) {
    createSalaries(month: $month)
  }
`;

export default CREATE_SALARIES;
