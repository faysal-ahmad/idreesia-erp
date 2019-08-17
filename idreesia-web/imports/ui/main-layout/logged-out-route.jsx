import React from "react";
import PropTypes from "prop-types";

import { LoginForm } from "./";

const loginFormWrapperStyle = {
  width: "300px",
  height: "200px",
  position: "absolute",
  top: "50%",
  left: "50%",
  marginTop: "-100px",
  marginLeft: "-150px",
};

const LoggedOutRoute = props => {
  const { location, history } = props;
  return (
    <div style={loginFormWrapperStyle}>
      <LoginForm location={location} history={history} />
    </div>
  );
};

LoggedOutRoute.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default LoggedOutRoute;
