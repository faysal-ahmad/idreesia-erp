import React, { useState } from 'react';
import { Button, Popup } from 'antd-mobile';
import EmojiPicker, { EmojiStyle, type EmojiClickData } from 'emoji-picker-react';

// The usual quick reactions; anything else is under "More".
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface Props {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

/** Bottom sheet with quick reactions and, under "More", every emoji. */
export const ReactionPicker = ({ visible, onSelect, onClose }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const close = () => {
    setShowAll(false);
    onClose();
  };
  const select = (emoji: string) => {
    setShowAll(false);
    onSelect(emoji);
  };

  return (
    <Popup
      bodyClassName="discussion-reaction-picker"
      destroyOnClose
      visible={visible}
      onClose={close}
      onMaskClick={close}
    >
      <div className="discussion-quick-reactions">
        {QUICK_REACTIONS.map(emoji => (
          <button
            aria-label={`React with ${emoji}`}
            className="discussion-quick-reaction"
            key={emoji}
            type="button"
            onClick={() => select(emoji)}
          >
            {emoji}
          </button>
        ))}
        {!showAll && (
          <Button className="discussion-more-reactions" fill="none" size="small" onClick={() => setShowAll(true)}>
            More
          </Button>
        )}
      </div>
      {showAll && (
        <EmojiPicker
          emojiStyle={EmojiStyle.NATIVE}
          height={360}
          lazyLoadEmojis
          previewConfig={{ showPreview: false }}
          width="100%"
          onEmojiClick={(data: EmojiClickData) => select(data.emoji)}
        />
      )}
    </Popup>
  );
};
