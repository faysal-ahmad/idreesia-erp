import React, { type ReactNode } from 'react';
import { Toast } from 'antd-mobile';
import {
  CheckCircleFill,
  CloseCircleFill,
  ExclamationCircleFill,
  InformationCircleFill,
} from 'antd-mobile-icons';

import { describeError } from '../utilities/describe-error';

// The app's one way to show a toast. A card drops in under the nav bar,
// spans the screen width and wraps whole words, with a coloured icon, a bold
// line saying what happened and, for errors, why. Tapping it dismisses it.
// Don't call antd-mobile's Toast.show directly: its stock toast is a narrow,
// centred box that breaks words in half ("uploa / d").

type ToastKind = 'success' | 'error' | 'warning' | 'info';

const icons: Record<ToastKind, ReactNode> = {
  success: <CheckCircleFill />,
  error: <CloseCircleFill />,
  warning: <ExclamationCircleFill />,
  info: <InformationCircleFill />,
};

// Long enough to read the text: errors carry two lines.
const durations: Record<ToastKind, number> = {
  success: 2000,
  error: 4500,
  warning: 3500,
  info: 3000,
};

interface ToastOptions {
  kind: ToastKind;
  title: string;
  detail?: string | null;
  /** In ms; 0 keeps it until tapped or replaced. */
  duration?: number;
}

export const showToast = ({ kind, title, detail, duration }: ToastOptions) =>
  Toast.show({
    maskClassName: `app-toast app-toast-${kind}`,
    duration: duration ?? durations[kind],
    content: (
      <div
        className="app-toast-card"
        role={kind === 'error' || kind === 'warning' ? 'alert' : 'status'}
        onClick={() => Toast.clear()}
      >
        <span className="app-toast-icon">{icons[kind]}</span>
        <div className="app-toast-text">
          <div className="app-toast-title">{title}</div>
          {detail && <div className="app-toast-detail">{detail}</div>}
        </div>
      </div>
    ),
  });

const normalise = (text: string) => text.toLowerCase().replace(/[.!\s]+$/, '');

/**
 * An action failed. `title` says what failed ("Could not upload the file.");
 * the detail line gives the server's reason, or a plain-language hint.
 */
export const showError = (error: unknown, title: string) => {
  const reason = describeError(error);
  const detail = reason && normalise(reason) !== normalise(title) ? reason : 'Please try again.';
  showToast({ kind: 'error', title, detail });
};

/** An action succeeded ("Folder renamed."). */
export const showSuccess = (title: string) => showToast({ kind: 'success', title });

/** Something the user needs to fix before going on ("Please add at least 2 options."). */
export const showWarning = (title: string, detail?: string) =>
  showToast({ kind: 'warning', title, detail });

/** Neutral information or a hint ("Hold to record, release to send"). */
export const showInfo = (title: string, detail?: string) => showToast({ kind: 'info', title, detail });
