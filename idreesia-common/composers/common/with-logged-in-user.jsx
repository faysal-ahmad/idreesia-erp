import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const formQuery = gql`
  query currentUser {
    currentUser {
      _id
      username
      permissions
    }
  }
`;

export default () => WrappedComponent => {
  const WithLoggedInUser = props => {
    const { data, loading, ...queryResult } = useQuery(formQuery);

    return (
      <WrappedComponent
        {...props}
        {...queryResult}
        loading={loading}
        userLoading={loading}
        user={data ? data.currentUser : null}
        currentUser={data ? data.currentUser : null}
      />
    );
  };

  WithLoggedInUser.propTypes = {
    userLoading: PropTypes.bool,
    user: PropTypes.object,
  };

  return WithLoggedInUser;
};
