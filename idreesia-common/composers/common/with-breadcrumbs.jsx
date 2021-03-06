import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setBreadcrumbs as setBreadcrumbsAction } from 'meteor/idreesia-common/action-creators';

export default breadcrumbs => WrappedComponent => {
  class WithBreadcrumbs extends Component {
    static propTypes = {
      setBreadcrumbs: PropTypes.func,
    };

    componentDidMount() {
      const { setBreadcrumbs } = this.props;
      setBreadcrumbs(breadcrumbs);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  const mapDispatchToProps = dispatch => ({
    setBreadcrumbs: bc => {
      dispatch(setBreadcrumbsAction(bc));
    },
  });

  return connect(
    null,
    mapDispatchToProps
  )(WithBreadcrumbs);
};
