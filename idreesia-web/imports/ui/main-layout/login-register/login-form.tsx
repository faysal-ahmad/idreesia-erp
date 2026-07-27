import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Button, Card, Divider, Flex, Form, Input, Typography, message } from 'antd';
import { useMutation } from '@apollo/client/react';

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';

import { UPDATE_LOGIN_TIME } from '../gql';

const AntButton = Button as any;
const AntCard = Card as any;
const AntDivider = Divider as any;
const AntFlex = Flex as any;
const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const TextInput = Input as any;
const AntTypography = Typography as any;
const { Link } = AntTypography;
type ShowForm = 'login' | 'register' | 'forgot';
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
interface BaseProps { history?: HistoryLike; location?: LocationLike; setShowForm(form: ShowForm): void; }

const LoginFormButtonStyle = {
  marginBottom: '10px',
  width: '100%',
};

export const LoginForm = ({ history, location, setShowForm }: BaseProps) => {
  const dispatch = useDispatch<any>();
  const [updateLoginTime] = useMutation(UPDATE_LOGIN_TIME as any);

  const handleFinish = (values: Record<string, string>) => {
    const { userName, password } = values;
    (Meteor as any).loginWithPassword(userName, password, (error?: Error) => {
      if (!error) {
        history?.push(location?.pathname ?? '/');
        dispatch(setLoggedInUserId(Meteor.userId()));
        updateLoginTime();
      } else {
        message.error(error.message, 5);
      }
    });
  };

  return (
    <AntCard title="Login to Idreesia" style={{ minWidth: 400 }}>
      <AntFlex justify='center'>
        <AntForm onFinish={handleFinish}>
          <AntFormItem
            name="userName"
            rules={[
              {
                required: true,
                message: 'Please input your email or username.',
              },
            ]}
          >
            <TextInput placeholder="Email / Username" />
          </AntFormItem>
          <AntFormItem
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password.',
              },
            ]}
          >
            <TextInput type="password" placeholder="Password" />
          </AntFormItem>
          <AntFormItem>
            <AntFlex justify='space-between' gap='small'>
              <AntButton type="primary" htmlType="submit" style={LoginFormButtonStyle as any} block>
                Log in
              </AntButton>
              <AntButton onClick={() => { setShowForm('forgot')}} style={LoginFormButtonStyle as any} block>
                Forgot Password
              </AntButton>
            </AntFlex>
          </AntFormItem>
        </AntForm>
      </AntFlex>
      <AntDivider style={{ marginTop: 0 }} />
      <AntFlex justify='center'>
        <Link onClick={() => { setShowForm('register')}}>Don't have an account? Register</Link>
      </AntFlex>
    </AntCard>
  );
};

LoginForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  setShowForm: PropTypes.func,
};
