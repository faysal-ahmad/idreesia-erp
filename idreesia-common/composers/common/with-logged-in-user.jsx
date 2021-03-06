import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';

export default () => WrappedComponent => {
  const WithLoggedInUser = props => <WrappedComponent {...props} />;

  WithLoggedInUser.propTypes = {
    userLoading: PropTypes.bool,
    user: PropTypes.object,
  };

  const formQuery = gql`
    query currentUser {
      currentUser {
        _id
        username
        permissions
      }
    }
  `;

  return flowRight(
    graphql(formQuery, {
      props: ({ data }) => ({
        userLoading: data.loading,
        user: data.currentUser,
        ...data,
      }),
    })
  )(WithLoggedInUser);
};
