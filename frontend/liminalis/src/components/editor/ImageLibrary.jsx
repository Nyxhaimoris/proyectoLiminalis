import { useTranslation } from "react-i18next";

export default function ImageLibrary({
  images,
  setImages,
  insertTextAtCursor
}) {
  const { t } = useTranslation();

  const remove = (token) => {
    setImages((prev) => {
      const next = { ...prev };
      URL.revokeObjectURL(next[token]?.src);
      delete next[token];
      return next;
    });
  };

  const clear = () => {
    Object.values(images).forEach((i) => URL.revokeObjectURL(i.src));
    setImages({});
  };

  if (!Object.keys(images).length) return null;

  return (
    <section className="image-library">
      <div className="image-library-head">
        <h3>{t("image_library.title")}</h3>

        <button onClick={clear}>
          {t("image_library.clear")}
        </button>
      </div>

      <div className="image-grid">
        {Object.entries(images).map(([token, data]) => (
          <div key={token} className="image-card">
            <img src={data.src} alt={data.name} />

            <code onClick={() => insertTextAtCursor(token)}>
              {token}
            </code>

            <button onClick={() => insertTextAtCursor(token)}>
              {t("image_library.insert")}
            </button>

            <button onClick={() => remove(token)}>
              {t("image_library.remove")}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}