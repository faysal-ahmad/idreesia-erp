import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { GlobalActionsCreator } from 'meteor/idreesia-common/action-creators';

export default () => WrappedComponent => {
  const WithActiveModule = props => <WrappedComponent {...props} />;

  WithActiveModule.propTypes = {
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  const mapStateToProps = state => ({
    activeModuleName: state.activeModuleName,
    activeSubModuleName: state.activeSubModuleName,
  });

  const mapDispatchToProps = dispatch => ({
    setActiveSubModuleName: subModuleName => {
      dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
    },
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(WithActiveModule);
};
