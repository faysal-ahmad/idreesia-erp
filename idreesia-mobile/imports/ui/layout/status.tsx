import React, { type ReactNode } from 'react';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { ExclamationCircleOutline, FileOutline, LockOutline } from 'antd-mobile-icons';

import { getErrorMessage } from '../auth/accounts';

// Standard loading / empty / error / no-access states. Every screen that
// loads data uses these instead of rendering nothing or ad-hoc messages.
// They use themed icons rather than antd-mobile's stock (blue) illustrations.

const StatusIcon = ({ children }: { children: ReactNode }) => (
  <span className="page-status-icon">{children}</span>
);

export const PageLoading = () => (
  <div className="page-status">
    <SpinLoading color="primary" />
  </div>
);

interface EmptyProps {
  title: string;
  description?: ReactNode;
  /** An antd-mobile-icons icon; defaults to a generic document. */
  icon?: ReactNode;
  /** Optional call to action, e.g. a "Register visitor" button. */
  action?: ReactNode;
}

export const PageEmpty = ({ title, description, icon, action }: EmptyProps) => (
  <div className="page-status">
    <ErrorBlock
      description={description ?? ''}
      image={<StatusIcon>{icon ?? <FileOutline />}</StatusIcon>}
      title={title}
    >
      {action}
    </ErrorBlock>
  </div>
);

interface ErrorProps {
  error: unknown;
  onRetry?: () => void;
}

export const PageError = ({ error, onRetry }: ErrorProps) => (
  <div className="page-status">
    <ErrorBlock
      description={getErrorMessage(error, 'Please try again.')}
      image={
        <StatusIcon>
          <ExclamationCircleOutline />
        </StatusIcon>
      }
      title="Something went wrong"
    >
      {onRetry && (
        <Button color="primary" fill="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </ErrorBlock>
  </div>
);

export const NoAccess = () => (
  <div className="page-status">
    <ErrorBlock
      description="Your account doesn't have permission to use this. Ask an administrator if you need it."
      image={
        <StatusIcon>
          <LockOutline />
        </StatusIcon>
      }
      title="No access"
    />
  </div>
);
