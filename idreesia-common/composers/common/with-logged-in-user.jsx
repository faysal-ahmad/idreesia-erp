import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connect } from 'react-redux';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';

export default () => WrappedComponent => {
  const WithLoggedInUser = props => <WrappedComponent {...props} />;

  WithLoggedInUser.propTypes = {
    userByIdLoading: PropTypes.bool,
    userById: PropTypes.object,
  };

  const formQuery = gql`
    query userById($_id: String) {
      userById(_id: $_id) {
        _id
        username
        permissions
      }
    }
  `;

  const mapStateToProps = state => ({
    loggedInUser: state.loggedInUser,
  });

  return flowRight(
    connect(mapStateToProps),
    graphql(formQuery, {
      props: ({ data }) => ({ userByIdLoading: data.loading, ...data }),
      options: ({ loggedInUser }) => ({
        variables: { _id: loggedInUser ? loggedInUser._id : null },
      }),
    })
  )(WithLoggedInUser);
};
