import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { ForgotPasswordForm } from './forgot-password-form';

const FormWrapperStyle = {
  width: "300px",
  height: "200px",
  position: "absolute",
  top: "40%",
  left: "45%",
  marginTop: "-100px",
  marginLeft: "-150px",
};

type ShowForm = 'login' | 'register' | 'forgot';
type AnyProps = Record<string, any>;
const Login = LoginForm as any;
const Register = RegisterForm as any;
const ForgotPassword = ForgotPasswordForm as any;

export const LoginRegisterForm = (props: AnyProps) => {
  const [showForm, setShowForm] = useState<ShowForm>('login');
  let form = <div />;

  if (showForm === 'login') {
    form = <Login setShowForm={setShowForm} {...props} />;  
  } else if (showForm === 'register') {
    form = <Register setShowForm={setShowForm} {...props} />; 
  } else if (showForm === 'forgot'){
    form = <ForgotPassword setShowForm={setShowForm} {...props} />; 
  }

  return (
    <div style={FormWrapperStyle as any}>
      {form}
    </div>
  );
};

LoginRegisterForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};
