import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./styles/CreatePost.css";

import { compileToDoc, toSaveableDoc } from "../lib/compileToDoc";
import EditorToolbar from "../components/editor/EditorToolbar";
import EditorPanel from "../components/editor/EditorPanel";
import PreviewPanel from "../components/editor/PreviewPanel";
import ImageLibrary from "../components/editor/ImageLibrary";
import LinkModal from "../components/editor/LinkModal";
import AxiosConfig from "../config/AxiosConfig";
import { TAGS } from "../lib/PostParser";

import { usePostEditor } from "../lib/editor/usePostEditor";
import { useImageLibrary } from "../lib/editor/useImageLibrary";

export default function CreatePost() {
    // Translation hook
    const { t } = useTranslation();

    const [title, setTitle] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);

    const {
        content,                 // raw editor content
        setContent,              // update content
        textareaRef,             // textarea DOM ref
        insertTextAtCursor,     // insert text at cursor position
        applyTag                // apply formatting tags
    } = usePostEditor();

    const {
        images,
        setImages,
        handleFiles
    } = useImageLibrary(insertTextAtCursor);

    // UI MODES
    // edit, split, preview
    const [mode, setMode] = useState("split");

    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({ url: "", label: "" });

    // DOCUMENT COMPILATION
    const doc = useMemo(
        () => compileToDoc(content, images),
        [content, images]
    );

    const handlePickImages = () => {
        document.getElementById("file-input")?.click();
    };

    const uploadImages = async (postId) => {
        for (const [token, image] of Object.entries(images)) {
            if (!image.file) continue;

            const formData = new FormData();
            formData.append("image", image.file);
            formData.append("post_id", postId);
            formData.append("token", token);

            await AxiosConfig.post("/posts/upload-image", formData);
        }
    };

    const handleInsertLink = useCallback(() => {
        setLinkData({ url: "", label: "" });
        setLinkModalOpen(true);
    }, []);

    const handlePublish = async () => {
        setIsPublishing(true);

        try {
            // Prepare post payload
            const payload = {
                title,
                content: toSaveableDoc(doc),
            };

            // Create post first
            const { data } = await AxiosConfig.post("/posts", payload);
            const postId = data.post_id;

            // Upload images after post creation
            await uploadImages(postId);

            console.log(t("create_post.success"));
        } catch (err) {
            console.error(t("create_post.error"), err);
        } finally {
            setIsPublishing(false);
        }
    };

    const confirmInsertLink = useCallback(() => {
        const { url, label } = linkData;
        if (!url) return;

        // Normalize URL
        const safeUrl = url.startsWith("http") ? url : `https://${url}`;
        const finalLabel = label || url;

        // Encode link into editor token format
        const token = `[L|${safeUrl}|${finalLabel}]`;

        insertTextAtCursor(token + " ");
        setLinkModalOpen(false);
    }, [linkData, insertTextAtCursor]);

    return (
        <div className={`create-post-page mode-${mode}`}>

            <input
                className="post-title-input"
                type="text"
                placeholder={t("create_post.title_placeholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <EditorToolbar
                tags={TAGS}
                mode={mode}
                setMode={setMode}
                onTag={applyTag}
                onPickImages={handlePickImages}
                onInsertLink={handleInsertLink}
                labels={{
                    edit: t("create_post.modes.edit"),
                    split: t("create_post.modes.split"),
                    preview: t("create_post.modes.preview")
                }}
            />

            <main className="create-post-main">
                <EditorPanel
                    mode={mode}
                    textareaRef={textareaRef}
                    content={content}
                    setContent={setContent}
                    insertTextAtCursor={insertTextAtCursor}
                />

                <PreviewPanel
                    mode={mode}
                    doc={doc}
                />
            </main>

            <ImageLibrary
                images={images}
                setImages={setImages}
                insertTextAtCursor={insertTextAtCursor}
                title={t("create_post.image_library.title")}
            />

            {/* Hidden file input for image upload */}
            <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
            />

            <LinkModal
                open={linkModalOpen}
                value={linkData}
                onChange={setLinkData}
                onClose={() => setLinkModalOpen(false)}
                onConfirm={confirmInsertLink}
                config={{
                    title: t("create_post.link_modal.title"),
                    urlLabel: t("create_post.link_modal.url"),
                    textLabel: t("create_post.link_modal.label"),
                    cancelText: t("create_post.link_modal.cancel"),
                    confirmText: t("create_post.link_modal.confirm")
                }}
            />

            <button
                className="publish-btn"
                onClick={handlePublish}
                disabled={isPublishing}
            >
                {isPublishing
                    ? t("create_post.publishing")
                    : t("create_post.publish_btn")}
            </button>
        </div>
    );
}