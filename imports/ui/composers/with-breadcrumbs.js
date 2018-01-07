import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { GlobalActionsCreator } from '/imports/ui/action-creators';

export default breadcrumbs => WrappedComponent => {
  class WithBreadcrumbs extends Component {
    static propTypes = {
      setBreadcrumbs: PropTypes.func
    };

    componentWillMount() {
      const { setBreadcrumbs } = this.props;
      setBreadcrumbs(breadcrumbs);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  const mapDispatchToProps = dispatch => {
    return {
      setBreadcrumbs: breadcrumbs => {
        dispatch(GlobalActionsCreator.setBreadcrumbs(breadcrumbs));
      }
    };
  };

  return connect(null, mapDispatchToProps)(WithBreadcrumbs);
};
