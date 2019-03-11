import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAccountMonthlyBalancesByCompany = props => (
    <WrappedComponent {...props} />
  );

  WithAccountMonthlyBalancesByCompany.propTypes = {
    accountMonthlyBalancesLoading: PropTypes.bool,
    accountMonthlyBalancesByCompanyId: PropTypes.array,
  };

  const accountMonthlyBalancesQuery = gql`
    query accountMonthlyBalancesByCompanyId(
      $monthString: String!
      $companyId: String!
    ) {
      accountMonthlyBalancesByCompanyId(
        monthString: $monthString
        companyId: $companyId
      ) {
        _id
        companyId
        accountHeadId
        monthString
        prevBalance
        credits
        debits
        balance
      }
    }
  `;

  return graphql(accountMonthlyBalancesQuery, {
    props: ({ data }) => ({
      accountMonthlyBalancesLoading: data.loading,
      ...data,
    }),
    options: ({ monthString, companyId }) => ({
      variables: { companyId, monthString },
    }),
  })(WithAccountMonthlyBalancesByCompany);
};
