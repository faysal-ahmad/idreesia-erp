import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { parse } from 'query-string';
import { withRouter } from 'react-router';

export default () => WrappedComponent => {
  class WithQueryParams extends Component {
    static propTypes = {
      match: PropTypes.object,
      history: PropTypes.object,
      location: PropTypes.object
    };

    render() {
      const params = parse(location.search);
      return <WrappedComponent params={params} {...this.props} />;
    }
  }

  return withRouter(WithQueryParams);
};
