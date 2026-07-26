import React, { type ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, unknown>;

interface CurrentUserData {
  currentUser: {
    _id: string;
    username?: string | null;
    permissions?: string[] | null;
  } | null;
}

const formQuery = gql`
  query currentUser {
    currentUser {
      _id
      username
      permissions
    }
  }
`;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithLoggedInUser: React.FC<AnyProps> = props => {
    const { data, loading, ...queryResult } = useQuery<CurrentUserData>(
      formQuery
    );

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
