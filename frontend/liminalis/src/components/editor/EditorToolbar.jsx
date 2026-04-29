export default function EditorToolbar({
  tags,
  mode,
  setMode,
  onTag,
  onPickImages,
  onInsertLink,
}) {
  return (
    <header className="create-post-toolbar">
      <div className="toolbar-group">
        {Object.entries(tags).map(([symbol, label]) => (
          <button
            key={symbol}
            onClick={() => onTag(symbol)}
            className="tool-btn"
            title={label}
          >
            {symbol}
          </button>
        ))}

        <button className="tool-btn tool-btn-img" onClick={onPickImages}>
          IMG
        </button>

        <button className="tool-btn" onClick={onInsertLink}>
          LINK
        </button>
      </div>

      <div className="toolbar-group">
        {["editor", "split", "preview"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`view-btn ${mode === m ? "active" : ""}`}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}