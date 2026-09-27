import React, { useState } from 'react';
import { Input, type InputProps } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';

type Props = Omit<InputProps, 'type'>;

/** Password field with a show/hide toggle. Works as a Form.Item child. */
export const PasswordInput = (props: Props) => {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOutline : EyeInvisibleOutline;

  return (
    <div className="password-input">
      <Input {...props} type={visible ? 'text' : 'password'} />
      <button
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="password-input-toggle"
        type="button"
        onClick={() => setVisible((value) => !value)}
      >
        <Icon />
      </button>
    </div>
  );
};
