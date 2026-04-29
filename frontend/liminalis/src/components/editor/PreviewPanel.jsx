export default function PreviewPanel({ mode, doc }) {
  if (mode === "editor") return null;

  const renderInline = (inline) => {
    return inline.map((node, i) => {
      if (node.type === "link") {
        return (
          <a
            key={i}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {node.text}
          </a>
        );
      }

      return node.value;
    });
  };

  return (
    <section className="preview-panel">
      {doc.blocks.length === 0 ? (
        <div className="empty-state"></div>
      ) : (
        doc.blocks.map((block, i) => {
          if (block.type === "image") {
            return (
              <div
                key={i}
                className="render-line"
                style={{ textAlign: block.align }}
              >
                <img src={block.src} alt={block.name ?? ""} />
              </div>
            );
          }

          const style = {
            textAlign: block.align,
            fontWeight: block.marks?.bold ? "700" : "400",
            fontStyle: block.marks?.italic ? "italic" : "normal",
            textDecoration:
              [
                block.marks?.underline ? "underline" : null,
                block.marks?.strike ? "line-through" : null,
              ]
                .filter(Boolean)
                .join(" ") || "none",
          };

          const hasInline = Array.isArray(block.inline) && block.inline.length > 0;

          return (
            <div key={i} className="render-line" style={style}>
              {hasInline ? renderInline(block.inline) : block.text || <br />}
            </div>
          );
        })
      )}
    </section>
  );
}