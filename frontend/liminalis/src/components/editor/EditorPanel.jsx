export default function EditorPanel({
  mode,
  textareaRef,
  content,
  setContent,
}) {
  if (mode === "preview") return null;

  return (
    <section className="editor-panel">
      <textarea
        ref={textareaRef}
        className="post-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
      />
    </section>
  );
}