import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { ForgotPasswordForm } from './forgot-password-form';

const FormWrapperStyle = {
  width: "300px",
  height: "200px",
  position: "absolute",
  top: "50%",
  left: "50%",
  marginTop: "-100px",
  marginLeft: "-150px",
};

export const LoginRegisterForm = props => {
  const [showForm, setShowForm] = useState('login');
  let form = <div />;

  if (showForm === 'login') {
    form = <LoginForm setShowForm={setShowForm} {...props} />;  
  } else if (showForm === 'register') {
    form = <RegisterForm setShowForm={setShowForm} {...props} />; 
  } else if (showForm === 'forgot'){
    form = <ForgotPasswordForm setShowForm={setShowForm} {...props} />; 
  }

  return (
    <div style={FormWrapperStyle}>
      {form}
    </div>
  );
};

LoginRegisterForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};
