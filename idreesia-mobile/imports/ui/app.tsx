import React, { type FormEvent, useMemo, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';

import {
  backendAccounts,
  backendConnection,
  backendUrl,
  hasBackendUrl,
} from './backend-connection';

type AuthMode = 'login' | 'register';

interface HomeProps {
  userId: string;
}

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  userId: string | null;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object') {
    const maybeError = error as { reason?: string; message?: string };

    return maybeError.reason || maybeError.message || fallback;
  }

  return fallback;
};

const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isRegistering = mode === 'register';

  const submitLabel = useMemo(
    () => (isRegistering ? 'Create Account' : 'Sign In'),
    [isRegistering]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (!backendAccounts) {
      setMessage('Configure public.backendUrl before signing in.');
      return;
    }

    const accounts = backendAccounts;

    if (isRegistering && password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await new Promise<void>((resolve, reject) => {
          accounts.createUser({ email, password }, error => {
            if (error) reject(error);
            else resolve();
          });
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          accounts.loginWithPassword(email, password, error => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
    } catch (error) {
      setMessage(getErrorMessage(error, 'Authentication failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <p className="eyebrow">Idreesia ERP</p>
      <h1>{isRegistering ? 'Create your mobile account' : 'Welcome back'}</h1>
      <p>
        Sign in with the same account used by the Idreesia web app. The mobile
        client connects to the configured web backend.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="email">
          Email
          <input
            id="email"
            autoCapitalize="none"
            autoComplete="email"
            inputMode="email"
            required
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
        </label>

        <label className="field-label" htmlFor="password">
          Password
          <input
            id="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            required
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
        </label>

        {isRegistering && (
          <label className="field-label" htmlFor="confirm-password">
            Confirm Password
            <input
              id="confirm-password"
              autoComplete="new-password"
              required
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
            />
          </label>
        )}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Please wait...' : submitLabel}
        </button>
      </form>

      {message && <p className="status-message">{message}</p>}

      <p className="helper-row">
        {isRegistering ? 'Already have an account?' : 'Need an account?'}
        <button
          className="link-button"
          type="button"
          onClick={() => {
            setMessage('');
            setMode(isRegistering ? 'login' : 'register');
          }}
        >
          {isRegistering ? 'Sign in' : 'Register'}
        </button>
      </p>
    </section>
  );
};

const Home = ({ userId }: HomeProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    if (!backendAccounts) {
      setMessage('Configure public.backendUrl before signing out.');
      return;
    }

    const accounts = backendAccounts;

    setIsLoggingOut(true);
    setMessage('');

    try {
      await new Promise<void>((resolve, reject) => {
        accounts.logout(error => {
          if (error) reject(error);
          else resolve();
        });
      });
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not sign out.'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <section className="home-card">
      <p className="eyebrow">Signed In</p>
      <h1>Idreesia Mobile</h1>
      <p>Your session is authenticated against the configured web backend.</p>
      <p className="user-id">User ID: {userId}</p>
      <button
        className="secondary-button"
        disabled={isLoggingOut}
        type="button"
        onClick={handleLogout}
      >
        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
      </button>
      {message && <p className="status-message">{message}</p>}
    </section>
  );
};

const App = () => {
  const { connected, connecting, userId } = useTracker<ConnectionState>(() => {
    if (!backendConnection || !backendAccounts) {
      return { connected: false, connecting: false, userId: null };
    }

    const status = backendConnection.status();

    return {
      connected: status.connected,
      connecting: status.status === 'connecting',
      userId: backendAccounts.userId(),
    };
  }, []);

  return (
    <main className="app-shell">
      <div>
        {!hasBackendUrl && (
          <p className="connection-warning">
            Missing backend URL. Add public.backendUrl to Meteor settings.
          </p>
        )}
        {hasBackendUrl && !connected && (
          <p className="connection-warning">
            {connecting ? 'Connecting' : 'Disconnected'} from {backendUrl}
          </p>
        )}
        {userId ? <Home userId={userId} /> : <AuthForm />}
      </div>
    </main>
  );
};

export default App;
