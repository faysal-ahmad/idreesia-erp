import React from 'react';
import { Dialog } from 'antd-mobile';

import { showError } from '../../layout';
import { MicrophoneBlockedError } from './use-voice-recorder';

/**
 * Tells the user why recording could not start. A refused microphone
 * permission gets a dialog with the steps to undo it (it stays until
 * dismissed); anything else is a short toast.
 */
export const showRecordingError = (error: unknown) => {
  if (error instanceof MicrophoneBlockedError) {
    Dialog.alert({
      title: 'Microphone is turned off',
      content: (
        <div className="microphone-help">
          <p>To record audio, allow this app to use the microphone:</p>
          <ol>
            <li>Open your phone&apos;s Settings</li>
            <li>Find Eastern Breeze ERP</li>
            <li>Turn on Microphone</li>
          </ol>
          <p>Then come back and try again.</p>
        </div>
      ),
      confirmText: 'OK',
    });
    return;
  }
  showError(error, 'Could not start recording.');
};
