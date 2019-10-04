import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setBreadcrumbs as setBreadcrumbsAction } from 'meteor/idreesia-common/action-creators';

export default getBreadcrumbs => WrappedComponent => {
  class WithDynamicBreadcrumbs extends Component {
    static propTypes = {
      setBreadcrumbs: PropTypes.func,
    };

    componentDidMount() {
      const { setBreadcrumbs } = this.props;
      const breadcrumbs = getBreadcrumbs(this.props)
        .split(',')
        .map(str => str.trim());
      setBreadcrumbs(breadcrumbs);
    }

    componentDidUpdate(prevProps) {
      const { setBreadcrumbs } = this.props;
      const prevBreadcrumbs = getBreadcrumbs(prevProps);
      const newBreadcrumbs = getBreadcrumbs(this.props);
      if (prevBreadcrumbs !== newBreadcrumbs) {
        const breadcrumbs = newBreadcrumbs.split(',').map(str => str.trim());
        setBreadcrumbs(breadcrumbs);
      }
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
  )(WithDynamicBreadcrumbs);
};
