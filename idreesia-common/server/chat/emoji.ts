/**
 * Emoji ⇄ Rocket.Chat shortcode conversion.
 *
 * Rocket.Chat (8.x, "native" emoji) names emoji by shortcode (`:smile:`),
 * built from emojibase-data: JoyPixels shortcodes first, then Emojibase's,
 * with skin-tone variants falling back to `<name>_tone<N>`. This mirrors
 * that build (same emojibase-data version) so reactions we send are names
 * Rocket.Chat accepts, and shortcodes it stores can be shown as emoji.
 */

interface EmojibaseSkin {
  hexcode: string;
  emoji: string;
  tone?: number | number[];
}

interface EmojibaseEmoji {
  hexcode: string;
  emoji: string;
  group?: number;
  skins?: EmojibaseSkin[];
}

type ShortcodeMap = Record<string, string | string[]>;

const loadData = () => ({
  data: require('emojibase-data/en/data.json') as EmojibaseEmoji[],
  joypixels: require('emojibase-data/en/shortcodes/joypixels.json') as ShortcodeMap,
  emojibase: require('emojibase-data/en/shortcodes/emojibase.json') as ShortcodeMap,
});

const COMPONENT_GROUP = 2;

// Variation selector 16 is optional in many emoji; match with or without.
const stripVariation = (emoji: string) => emoji.replace(/\uFE0F/g, '');

let maps: {
  shortcodeToEmoji: Map<string, string>;
  emojiToShortcode: Map<string, string>;
} | null = null;

const getMaps = () => {
  if (maps) return maps;
  const { data, joypixels, emojibase } = loadData();
  const shortcodesOf = (hexcode: string): string[] => {
    const entry = joypixels[hexcode] ?? emojibase[hexcode];
    if (!entry) return [];
    return Array.isArray(entry) ? entry : [entry];
  };

  const shortcodeToEmoji = new Map<string, string>();
  const emojiToShortcode = new Map<string, string>();
  const register = (emoji: string, primary: string, alternates: string[]) => {
    [primary, ...alternates].forEach(code => {
      if (!shortcodeToEmoji.has(code)) shortcodeToEmoji.set(code, emoji);
    });
    emojiToShortcode.set(emoji, primary);
    emojiToShortcode.set(stripVariation(emoji), primary);
  };

  data.forEach(entry => {
    if (entry.group === COMPONENT_GROUP) return;
    const codes = shortcodesOf(entry.hexcode);
    if (codes.length === 0) return;
    const [primary, ...alternates] = codes;
    register(entry.emoji, primary, alternates);

    (entry.skins ?? []).forEach(skin => {
      if (!skin.tone) return;
      const tones = Array.isArray(skin.tone) ? skin.tone : [skin.tone];
      const skinCodes = shortcodesOf(skin.hexcode);
      const skinPrimary = skinCodes[0] ?? `${primary}_tone${tones.join('-')}`;
      register(skin.emoji, skinPrimary, skinCodes.slice(1));
    });
  });

  maps = { shortcodeToEmoji, emojiToShortcode };
  return maps;
};

/** `:smile:` (or `smile`) → 😄, or null when unknown. */
export const shortcodeToEmoji = (shortcode: string): string | null =>
  getMaps().shortcodeToEmoji.get(shortcode.replace(/^:|:$/g, '')) ?? null;

/** 😄 → `:smile:`, or null when Rocket.Chat has no name for it. */
export const emojiToShortcode = (emoji: string): string | null => {
  const { emojiToShortcode: lookup } = getMaps();
  const code = lookup.get(emoji) ?? lookup.get(stripVariation(emoji));
  return code ? `:${code}:` : null;
};

/** Replaces known `:shortcode:`s in message text with the emoji. */
export const replaceShortcodes = (text: string): string =>
  text.replace(/:([a-z0-9_+-]+):/gi, (match, code: string) =>
    shortcodeToEmoji(code) ?? match
  );
