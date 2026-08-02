import React, { type CSSProperties, useState } from 'react';
import { type History, type Location } from 'history';

import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { ForgotPasswordForm } from './forgot-password-form';

const FormWrapperStyle: CSSProperties = {
  width: '300px',
  height: '200px',
  position: 'absolute',
  top: '40%',
  left: '45%',
  marginTop: '-100px',
  marginLeft: '-150px',
};

type ShowForm = 'login' | 'register' | 'forgot';

interface Props {
  history?: History;
  location?: Location;
}

export const LoginRegisterForm = ({ history, location }: Props) => {
  const [showForm, setShowForm] = useState<ShowForm>('login');
  let form = <div />;

  if (showForm === 'login') {
    form = (
      <LoginForm
        setShowForm={setShowForm}
        history={history}
        location={location}
      />
    );
  } else if (showForm === 'register') {
    form = <RegisterForm setShowForm={setShowForm} />;
  } else if (showForm === 'forgot') {
    form = <ForgotPasswordForm setShowForm={setShowForm} />;
  }

  return <div style={FormWrapperStyle}>{form}</div>;
};
