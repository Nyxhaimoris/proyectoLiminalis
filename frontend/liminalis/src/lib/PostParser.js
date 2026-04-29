export const TAGS = {
  B: "Bold",
  I: "Italic",
  U: "Underline",
  S: "Strike",
  C: "Center",
};

export const TAG_ORDER = ["B", "I", "U", "S", "C"];

export const IMAGE_TOKEN_REGEX = /^\[IMG-[A-Z0-9-]+\]$/i;
export const LINK_TOKEN_REGEX = /\[L\|([^\]|]+)\|([^\]]+)\]/gi;

const SAFE_LINK_PROTOCOLS = /^(https?:|mailto:|tel:)/i;

/**
 * Generates a unique image token like:
 * [IMG-KLJ32-ABCD1234s]
 */
export function createImageToken() {
  const left = Date.now().toString(36).toUpperCase();
  const right = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `[IMG-${left}-${right}]`;
}

/**
 * Extracts tags from a line prefix like:
 * [B][C]Hello world
 */
export function splitPrefixTags(line) {
  let rest = line;
  const tags = new Set();

  while (rest.startsWith("[")) {
    const match = rest.match(/^\[([BIUSC]+)\]/i);
    if (!match) break;

    match[1]
      .toUpperCase()
      .split("")
      .forEach((tag) => tags.add(tag));

    rest = rest.slice(match[0].length);
  }

  return { tags, rest };
}

/**
 * Rebuilds prefix like:
 * [B][C]
 */
export function buildPrefix(tagsSet) {
  const ordered = TAG_ORDER.filter((tag) => tagsSet.has(tag));
  return ordered.map((tag) => `[${tag}]`).join("");
}

/**
 * Toggles a tag in a single line
 */
export function toggleTagInLine(line, tag) {
  const { tags, rest } = splitPrefixTags(line);

  if (tags.has(tag)) {
    tags.delete(tag);
  } else {
    tags.add(tag);
  }

  return `${buildPrefix(tags)}${rest}`;
}

/**
 * Finds which line index a cursor position belongs to
 */
export function getLineIndexAtPos(text, pos) {
  const lines = text.split("\n");
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineLen = lines[i].length;
    const lineEnd = offset + lineLen;

    if (pos <= lineEnd) return i;

    offset += lineLen + 1;
  }

  return Math.max(0, lines.length - 1);
}

/**
 * Computes style for the line based on tags
 */
export function getLineStyle(tags, isImage) {
  const isCentered = tags.has("C");

  if (isImage) {
    return {
      display: "flex",
      justifyContent: isCentered ? "center" : "flex-start",
      alignItems: "center",
      minHeight: "1.2em",
      width: "100%",
      paddingBlock: "4px",
      textAlign: isCentered ? "center" : "left",
    };
  }

  return {
    display: "block",
    minHeight: "1.2em",
    textAlign: isCentered ? "center" : "left",
    fontWeight: tags.has("B") ? "700" : "400",
    fontStyle: tags.has("I") ? "italic" : "normal",
    textDecoration:
      [
        tags.has("U") ? "underline" : null,
        tags.has("S") ? "line-through" : null,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "none",
  };
}

function sanitizeLinkUrl(url) {
  const value = String(url ?? "").trim();
  if (!value) return null;
  if (!SAFE_LINK_PROTOCOLS.test(value)) return null;
  return value;
}

function parseInlineNodes(text) {
  const nodes = [];
  let lastIndex = 0;

  const regex = new RegExp(LINK_TOKEN_REGEX);
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, rawUrl, rawLabel] = match;

    if (match.index > lastIndex) {
      nodes.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    const href = sanitizeLinkUrl(rawUrl);
    const label = rawLabel ?? "";

    if (href) {
      nodes.push({
        type: "link",
        href,
        text: label,
      });
    } else {
      nodes.push({
        type: "text",
        value: fullMatch,
      });
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return nodes;
}

/**
 * Parses a single line into structured data
 */
export function parseLine(rawLine, imageStore = {}) {
  const { tags, rest } = splitPrefixTags(rawLine);
  const text = rest;

  const trimmed = text.trim();
  const tokenMatch = trimmed.match(IMAGE_TOKEN_REGEX);

  const imageToken = tokenMatch ? trimmed.toUpperCase() : null;
  const imageData = imageToken ? imageStore[imageToken] : null;
  const isImage = Boolean(imageData);

  return {
    original: rawLine,
    text,
    tags,
    isImage,
    imageToken,
    imageSrc: imageData?.src ?? null,
    inline: isImage ? null : parseInlineNodes(text),
    style: getLineStyle(tags, isImage),
  };
}