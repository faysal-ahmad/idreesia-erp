import React, { useState } from 'react';
import { Popover } from 'antd';
import EmojiPicker, { EmojiStyle, type EmojiClickData } from 'emoji-picker-react';

interface Props {
  onSelect(emoji: string): void;
  children: React.ReactElement;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

/** Opens an emoji picker from its child (e.g. a button). */
const EmojiPickerPopover = ({ onSelect, children, placement = 'topLeft' }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger="click"
      placement={placement}
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      styles={{ container: { padding: 0 } }}
      destroyOnHidden
      content={
        <EmojiPicker
          onEmojiClick={(emojiData: EmojiClickData) => {
            onSelect(emojiData.emoji);
            setOpen(false);
          }}
          emojiStyle={EmojiStyle.NATIVE}
          lazyLoadEmojis
          previewConfig={{ showPreview: false }}
          width={340}
          height={400}
        />
      }
    >
      {children}
    </Popover>
  );
};

export default EmojiPickerPopover;
