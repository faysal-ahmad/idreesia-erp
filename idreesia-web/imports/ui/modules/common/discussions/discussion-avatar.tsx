import React, { useState } from 'react';

// Letter avatars get a stable colour per name, like Rocket.Chat's default
// avatars.
const AVATAR_COLOURS = [
  '#1d74f5',
  '#2de0a5',
  '#f5455c',
  '#ffd21f',
  '#9ea2a8',
  '#7f1a8b',
  '#f38c39',
  '#0a9396',
];

const avatarColour = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 2147483647;
  }
  return AVATAR_COLOURS[hash % AVATAR_COLOURS.length];
};

interface Props {
  name: string;
  url: string | null;
  className: string;
}

/**
 * A person's profile picture, or a coloured letter avatar when there is no
 * picture or it fails to load (so broken-image alt text never shows).
 */
const DiscussionAvatar = ({ name, url, className }: Props) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (url && url !== failedUrl) {
    return (
      <img
        className={`${className} discussion-avatar-image`}
        src={url}
        alt=""
        onError={() => setFailedUrl(url)}
      />
    );
  }
  return (
    <span
      className={`${className} discussion-avatar-letter`}
      style={{ background: avatarColour(name) }}
      aria-label={name}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
};

export default DiscussionAvatar;
