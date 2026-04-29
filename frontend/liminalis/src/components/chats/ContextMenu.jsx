import React from "react";

const ContextMenu = ({ x, y, onDelete, onClose, content, canDelete }) => {
  const handleCopy = async (e) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(content || "");
    } catch (err) {
      console.error(err);
    }

    onClose();
  };

  return (
    <>
      <div
        className="context-menu-overlay"
        onClick={onClose}
      />

      <div
        className="context-menu"
        style={{
          position: "fixed",
          top: y,
          left: x,
          zIndex: 9999,
        }}
      >
        <button onClick={handleCopy}>Copy Message</button>

        {/* ONLY SHOW IF ALLOWED */}
        {canDelete && (
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete Message
          </button>
        )}
      </div>
    </>
  );
};

export default ContextMenu;