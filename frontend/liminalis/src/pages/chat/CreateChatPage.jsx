import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AxiosConfig from "../../config/AxiosConfig";
import "./styles/CreateChatPage.css";

const CreateChatPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [visibility, setVisibility] = useState("public");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const createGroup = async () => {
    const res = await AxiosConfig.post(`/chats/group`, {
      name,
      visibility,
    });

    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      if (!name.trim()) {
        alert(t("create_chat.errors.name_required"));
        setLoading(false);
        return;
      }

      const data = await createGroup();

      if (data?.chat_id) {
        navigate(`/chat/${data.chat_id}`);
      } else {
        alert(data?.message || t("create_chat.errors.generic"));
      }
    } catch (error) {
      console.error("Create chat error:", error);
      alert(t("create_chat.errors.server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-chat-container">
      <h2>{t("create_chat.title")}</h2>

      <form onSubmit={handleSubmit} className="create-chat-form">
        <div className="field">
          <label>{t("create_chat.group_name")}</label>
          <input
            type="text"
            placeholder={t("create_chat.group_placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label>{t("create_chat.visibility")}</label>

          <div className="toggle-group">
            <button
              type="button"
              className={visibility === "public" ? "active" : ""}
              onClick={() => setVisibility("public")}
            >
              {t("create_chat.public")}
            </button>

            <button
              type="button"
              className={visibility === "private" ? "active" : ""}
              onClick={() => setVisibility("private")}
            >
              {t("create_chat.private")}
            </button>
          </div>

          <small className="hint">
            {visibility === "public"
              ? t("create_chat.public_hint")
              : t("create_chat.private_hint")}
          </small>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading
            ? t("create_chat.creating")
            : t("create_chat.submit")}
        </button>
      </form>
    </div>
  );
};

export default CreateChatPage;