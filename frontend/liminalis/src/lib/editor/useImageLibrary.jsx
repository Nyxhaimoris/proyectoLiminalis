import { useCallback, useState } from "react";
import { createImageToken } from "../PostParser";

export function useImageLibrary(insertTextAtCursor) {
    const [images, setImages] = useState({});

    const handleFiles = useCallback((files) => {
        const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));

        const newImages = {};
        const tokens = [];

        for (const file of valid) {
            const token = createImageToken();

            newImages[token] = {
                src: URL.createObjectURL(file),
                file,              // important
                name: file.name,
                type: file.type,
                size: file.size,
            };

            tokens.push(token);
        }

        setImages((prev) => ({ ...prev, ...newImages }));
        insertTextAtCursor(tokens.join("\n") + "\n");
    }, [insertTextAtCursor]);

    return {
        images,
        setImages,
        handleFiles,
    };
}