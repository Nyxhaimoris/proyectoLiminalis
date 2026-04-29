import React from "react";
import { useTranslation } from "react-i18next";

export default function LinkModal({
  open,
  value,
  onChange,
  onClose,
  onConfirm
}) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t("link_modal.title")}</h3>

        <input
          placeholder={t("link_modal.url")}
          value={value.url}
          onChange={(e) =>
            onChange({ ...value, url: e.target.value })
          }
        />

        <input
          placeholder={t("link_modal.label")}
          value={value.label}
          onChange={(e) =>
            onChange({ ...value, label: e.target.value })
          }
        />

        <div className="modal-actions">
          <button onClick={onClose}>
            {t("link_modal.cancel")}
          </button>

          <button onClick={onConfirm}>
            {t("link_modal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}