import { parseLine } from "./PostParser";

/**
 * Converts the editor text into a structured document model.
 * This is the shape that can later be sent to the API.
 */
export function compileToDoc(content, imageStore = {}) {
  const lines = content.split("\n");

  return {
    type: "doc",
    blocks: lines.map((line) => {
      const parsed = parseLine(line, imageStore);
      const align = parsed.tags.has("C") ? "center" : "left";

      if (parsed.isImage) {
        const imageData = imageStore[parsed.imageToken];

        return {
          type: "image",
          token: parsed.imageToken,
          src: parsed.imageSrc, // preview-only; have strip this before saving
          name: imageData?.name ?? parsed.imageToken,
          mimeType: imageData?.type ?? null,
          size: imageData?.size ?? null,
          align,
        };
      }

      return {
        type: "paragraph",
        text: parsed.text,
        inline: parsed.inline ?? [],
        align,
        marks: {
          bold: parsed.tags.has("B"),
          italic: parsed.tags.has("I"),
          underline: parsed.tags.has("U"),
          strike: parsed.tags.has("S"),
        },
      };
    }),
  };
}

/**
 * Produces a save-safe version of the doc.
 * ALWAYS se this before POSTing to backend.
 */
export function toSaveableDoc(doc) {
  return {
    type: doc.type,
    blocks: (doc.blocks || []).map((block) => {
      if (block.type === "image") {
        const { src, ...safeImage } = block;
        return safeImage;
      }

      return {
        type: "paragraph",
        text: block.text ?? "",
        inline: Array.isArray(block.inline)
          ? block.inline.map((node) => {
              if (node.type === "link") {
                return {
                  type: "link",
                  href: node.href ?? "",
                  text: node.text ?? "",
                };
              }

              return {
                type: "text",
                value: node.value ?? "",
              };
            })
          : [],
        align: block.align ?? "left",
        marks: {
          bold: !!block.marks?.bold,
          italic: !!block.marks?.italic,
          underline: !!block.marks?.underline,
          strike: !!block.marks?.strike,
        },
      };
    }),
  };
}