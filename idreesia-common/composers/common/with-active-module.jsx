import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  setActiveModuleName as setActiveModuleNameAction,
  setActiveSubModuleName as setActiveSubModuleNameAction,
} from 'meteor/idreesia-common/action-creators';

export default () => WrappedComponent => {
  const WithActiveModule = props => <WrappedComponent {...props} />;

  WithActiveModule.propTypes = {
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveModuleName: PropTypes.func,
    setActiveSubModuleName: PropTypes.func,
  };

  const mapStateToProps = state => ({
    activeModuleName: state.activeModuleName,
    activeSubModuleName: state.activeSubModuleName,
  });

  const mapDispatchToProps = dispatch => ({
    setActiveModuleName: moduleName => {
      dispatch(setActiveModuleNameAction(moduleName));
    },
    setActiveSubModuleName: subModuleName => {
      dispatch(setActiveSubModuleNameAction(subModuleName));
    },
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(WithActiveModule);
};
