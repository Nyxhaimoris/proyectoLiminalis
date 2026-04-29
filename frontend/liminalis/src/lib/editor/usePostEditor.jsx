import { useCallback, useRef, useState } from "react";
import { getLineIndexAtPos, toggleTagInLine } from "../PostParser";

export function usePostEditor(initialContent = "") {
    const [content, setContent] = useState(initialContent);
    const textareaRef = useRef(null);

    const focusAndRestore = useCallback((start, end = start) => {
        const el = textareaRef.current;
        if (!el) return;

        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start, end);
        });
    }, []);

    const insertTextAtCursor = useCallback((text) => {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart ?? content.length;
        const end = el.selectionEnd ?? content.length;

        const next = content.slice(0, start) + text + content.slice(end);
        setContent(next);

        focusAndRestore(start + text.length);
    }, [content, focusAndRestore]);

    const applyTag = useCallback((tag) => {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart ?? 0;
        const end = el.selectionEnd ?? start;

        const lines = content.split("\n");

        const startLine = getLineIndexAtPos(content, Math.min(start, end));
        const endLine = getLineIndexAtPos(content, Math.max(start, end));

        const updated = lines.map((line, i) => {
            if (i < startLine || i > endLine) return line;
            return toggleTagInLine(line, tag);
        });

        setContent(updated.join("\n"));
        focusAndRestore(start, end);
    }, [content, focusAndRestore]);

    return {
        content,
        setContent,
        textareaRef,
        insertTextAtCursor,
        applyTag,
        focusAndRestore,
    };
}