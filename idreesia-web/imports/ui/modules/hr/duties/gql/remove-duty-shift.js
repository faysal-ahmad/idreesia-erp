import gql from 'graphql-tag';

const REMOVE_DUTY_SHIFT = gql`
  mutation removeDutyShift($_id: String!) {
    removeDutyShift(_id: $_id)
  }
`;

export default REMOVE_DUTY_SHIFT;
