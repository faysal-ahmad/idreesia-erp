import React, { useRef, useState } from 'react';
import { Avatar, Button, TextArea, type TextAreaRef } from 'antd-mobile';
import { AudioOutline, CameraOutline, LeftOutline } from 'antd-mobile-icons';

import { showError, showInfo, showToast } from '../../layout';
import { capturePhoto } from '../../utilities';
import { AttachmentIcon, SendIcon } from './icons';
import { showRecordingError } from './show-recording-error';
import { useVoiceRecorder } from './use-voice-recorder';

/** Someone who can be @mentioned. */
export interface MentionCandidate {
  username: string;
  name: string | null;
  avatarUrl?: string | null;
}

interface Props {
  onSendText: (text: string) => Promise<void>;
  onSendFile: (file: Blob, fileName: string) => Promise<void>;
  /** Suggested while typing "@…"; leave out where mentions don't apply. */
  mentionCandidates?: MentionCandidate[];
  placeholder?: string;
}

// The "@partial" right before the caret, at the start or after a space.
const MENTION_QUERY = /(?:^|\s)@([A-Za-z0-9._-]*)$/;
const MAX_SUGGESTIONS = 5;

// Press-and-hold voice notes, as in WhatsApp: hold the mic to record, let go
// to send, slide left to cancel. A quick tap records nothing and shows a hint.
const MIN_RECORDING_MS = 700;
const CANCEL_DISTANCE_PX = 90;

// Attachments picked from the gallery or files. Kept well under Rocket.Chat's
// upload limit, and reasonable over mobile data.
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

const dataUrlToBlob = async (dataUrl: string) => (await fetch(dataUrl)).blob();

const formatElapsed = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const showHoldHint = () => showInfo('Hold to record, release to send.');

/**
 * Pinned under the thread: attach and the text box on the left; camera and a
 * hold-to-record mic on the right, both replaced by a Send button once
 * there's text (as in WhatsApp). Enter adds a new line; only Send sends.
 */
export const MessageComposer = ({ onSendText, onSendFile, mentionCandidates, placeholder = 'Type a message…' }: Props) => {
  const [text, setText] = useState('');
  // The "@partial" being typed, while there is one.
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const textArea = useRef<TextAreaRef>(null);
  const [sending, setSending] = useState(false);
  // How far the finger has slid left while recording (<= 0), for the
  // "slide to cancel" feedback.
  const [slideX, setSlideX] = useState(0);

  const fileInput = useRef<HTMLInputElement>(null);
  const pressStartX = useRef(0);
  const pressing = useRef(false);
  const cancelledBySlide = useRef(false);

  const run = async (action: () => Promise<void>, failure: string) => {
    setSending(true);
    try {
      await action();
      return true;
    } catch (error) {
      showError(error, failure);
      return false;
    } finally {
      setSending(false);
    }
  };

  const recorder = useVoiceRecorder(({ blob, fileName }) => {
    run(() => onSendFile(blob, fileName), 'Could not send the voice note.');
  });

  const handleSendText = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    if (await run(() => onSendText(trimmed), 'Could not send the message.')) {
      setText('');
      setMentionQuery(null);
    }
  };

  const handlePhoto = async () => {
    const dataUrl = await capturePhoto();
    if (!dataUrl) return;
    await run(async () => onSendFile(await dataUrlToBlob(dataUrl), 'photo.jpg'), 'Could not send the photo.');
  };

  // The system picker: on iOS it offers Photo Library, Take Photo and Choose
  // Files; on Android the WebView opens the file chooser. Several files can be
  // picked and are sent one after another.
  const handleFilesPicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Clear it so picking the same file again still fires a change.
    if (fileInput.current) fileInput.current.value = '';
    if (files.length === 0) return;

    const tooLarge = files.filter(file => file.size > MAX_ATTACHMENT_BYTES);
    if (tooLarge.length > 0) {
      showToast({
        kind: 'error',
        title:
          tooLarge.length === 1
            ? `"${tooLarge[0].name}" is too large to send.`
            : `${tooLarge.length} files are too large to send.`,
        detail: 'Files can be at most 25 MB.',
      });
    }
    const toSend = files.filter(file => file.size <= MAX_ATTACHMENT_BYTES);
    if (toSend.length === 0) return;

    await run(async () => {
      for (const file of toSend) {
        await onSendFile(file, file.name || 'attachment');
      }
    }, 'Could not send the attachment.');
  };

  // --- Hold-to-record mic -------------------------------------------------

  const endPress = () => {
    pressing.current = false;
    setSlideX(0);
  };

  const handleMicDown = async (event: React.PointerEvent<HTMLButtonElement>) => {
    if (sending || pressing.current) return;
    event.preventDefault();
    // Keep receiving move/up events even if the finger leaves the button.
    event.currentTarget.setPointerCapture(event.pointerId);
    pressing.current = true;
    cancelledBySlide.current = false;
    pressStartX.current = event.clientX;
    try {
      const started = await recorder.start();
      if (!started && !cancelledBySlide.current) showHoldHint();
    } catch (error) {
      endPress();
      showRecordingError(error);
    }
  };

  const handleMicMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!pressing.current || cancelledBySlide.current) return;
    const dx = Math.min(0, event.clientX - pressStartX.current);
    setSlideX(dx);
    if (dx <= -CANCEL_DISTANCE_PX) {
      cancelledBySlide.current = true;
      recorder.cancel();
      endPress();
    }
  };

  const handleMicUp = () => {
    if (!pressing.current) return;
    endPress();
    if (cancelledBySlide.current) return;
    if (!recorder.recording) {
      // Still waiting for the microphone (e.g. the permission prompt); the
      // recorder discards it as soon as it starts.
      recorder.stop();
      return;
    }
    if (recorder.getElapsedMs() < MIN_RECORDING_MS) {
      recorder.cancel();
      showHoldHint();
      return;
    }
    recorder.stop();
  };

  const handleMicCancel = () => {
    if (!pressing.current) return;
    endPress();
    recorder.cancel();
  };

  // --- @mentions ---------------------------------------------------------

  const caret = () => textArea.current?.nativeElement?.selectionStart ?? text.length;

  const handleTextChange = (value: string) => {
    setText(value);
    if (!mentionCandidates?.length) return;
    // The caret has already moved by the time onChange runs.
    const position = textArea.current?.nativeElement?.selectionStart ?? value.length;
    const match = MENTION_QUERY.exec(value.slice(0, position));
    setMentionQuery(match ? match[1].toLowerCase() : null);
  };

  const suggestions =
    mentionQuery === null || !mentionCandidates
      ? []
      : mentionCandidates
          .filter(
            candidate =>
              candidate.username.toLowerCase().includes(mentionQuery) ||
              (candidate.name ?? '').toLowerCase().includes(mentionQuery),
          )
          .slice(0, MAX_SUGGESTIONS);

  const insertMention = (username: string) => {
    const position = caret();
    const before = text.slice(0, position).replace(/@[A-Za-z0-9._-]*$/, `@${username} `);
    const next = before + text.slice(position);
    setText(next);
    setMentionQuery(null);
    requestAnimationFrame(() => {
      const element = textArea.current?.nativeElement;
      if (!element) return;
      element.focus();
      element.setSelectionRange(before.length, before.length);
    });
  };

  const hasText = text.trim().length > 0;
  const slideProgress = Math.min(1, -slideX / CANCEL_DISTANCE_PX);

  const showSend = hasText && !recorder.recording;

  return (
    <div className={`chat-composer${recorder.recording ? ' chat-composer-recording' : ''}`}>
      {suggestions.length > 0 && !recorder.recording && (
        <div className="composer-mentions">
          {suggestions.map(candidate => (
            <button
              className="composer-mention"
              key={candidate.username}
              type="button"
              // Keep the keyboard up: don't let the tap blur the text box.
              onMouseDown={event => event.preventDefault()}
              onClick={() => insertMention(candidate.username)}
            >
              {candidate.avatarUrl ? (
                <Avatar className="composer-mention-avatar" src={candidate.avatarUrl} />
              ) : (
                <span className="composer-mention-avatar composer-mention-letter">
                  {(candidate.name ?? candidate.username).charAt(0).toUpperCase()}
                </span>
              )}
              <span className="composer-mention-name">{candidate.name ?? candidate.username}</span>
              <span className="composer-mention-username">@{candidate.username}</span>
            </button>
          ))}
        </div>
      )}
      {recorder.recording ? (
        <div className="chat-recording" key="recording">
          <span className="chat-recording-dot" />
          <span className="chat-recording-time">{formatElapsed(recorder.elapsedSeconds)}</span>
          <span
            className="chat-recording-cancel"
            style={{ opacity: 1 - slideProgress * 0.7, transform: `translateX(${slideX / 2}px)` }}
          >
            <LeftOutline /> Slide to cancel
          </span>
        </div>
      ) : (
        <div className="chat-composer-entry" key="entry">
          <Button
            aria-label="Attach a photo, video or file"
            className="chat-composer-icon"
            disabled={sending}
            fill="none"
            onClick={() => fileInput.current?.click()}
          >
            <AttachmentIcon />
          </Button>
          <input
            className="chat-file-input"
            multiple
            onChange={handleFilesPicked}
            ref={fileInput}
            tabIndex={-1}
            type="file"
          />
          <TextArea
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="chat-composer-input"
            maxLength={5000}
            onChange={handleTextChange}
            placeholder={placeholder}
            ref={textArea}
            // antd-mobile defaults to 2 rows, and its auto-size measures from
            // that, so minRows: 1 alone still starts two lines tall.
            rows={1}
            value={text}
          />
        </div>
      )}

      {showSend ? (
        <Button
          aria-label="Send message"
          className="chat-round-button"
          color="primary"
          key="send"
          loading={sending}
          onClick={handleSendText}
        >
          <SendIcon />
        </Button>
      ) : (
        <div className="chat-composer-actions" key="actions">
          {/* Hidden while recording; the mic stays at the far right either
              way, so it never moves under the finger. */}
          {!recorder.recording && (
            <Button
              aria-label="Take a photo"
              className="chat-composer-icon"
              disabled={sending}
              fill="none"
              onClick={handlePhoto}
            >
              <CameraOutline />
            </Button>
          )}
          <button
            aria-label="Hold to record a voice note"
            className={`chat-round-button chat-mic-button${
              recorder.recording ? ' chat-mic-button-active' : ''
            }`}
            disabled={sending}
            onContextMenu={event => event.preventDefault()}
            onPointerCancel={handleMicCancel}
            onPointerDown={handleMicDown}
            onPointerMove={handleMicMove}
            onPointerUp={handleMicUp}
            type="button"
          >
            <AudioOutline />
          </button>
        </div>
      )}
    </div>
  );
};
