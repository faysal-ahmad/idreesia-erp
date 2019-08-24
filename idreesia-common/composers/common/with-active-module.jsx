import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

export default () => WrappedComponent => {
  const WithActiveModule = props => <WrappedComponent {...props} />;

  WithActiveModule.propTypes = {
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
  };

  const mapStateToProps = state => ({
    activeModuleName: state.activeModuleName,
    activeSubModuleName: state.activeSubModuleName,
  });
  
  return connect(mapStateToProps)(WithActiveModule);
};
