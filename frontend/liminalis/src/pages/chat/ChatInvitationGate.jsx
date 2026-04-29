import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AxiosConfig from "../../config/AxiosConfig";

const ChatInvitationGate = () => {
  const { t } = useTranslation();
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);

        const res = await AxiosConfig.get(
          `/chats/invitations/by-chat/${chatId}`
        );

        const responseData = res.data?.data;

        if (Array.isArray(responseData) && responseData.length > 0) {
          setInvite(responseData[0]);
        } else if (responseData && typeof responseData === "object") {
          setInvite(responseData);
        } else {
          setInvite(null);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setInvite(null);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchInvite();
    } else {
      setLoading(false);
    }
  }, [chatId]);

  const handleAction = async (actionType) => {
    if (!invite?.id) return;

    setActionLoading(true);

    try {
      await AxiosConfig.post(`/chats/invitations/${invite.id}/${actionType}`);

      if (actionType === "accept") {
        navigate(`/chat/${chatId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(`Error during ${actionType}:`, err);
      alert(t("chat_invitation.errors.action"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>{t("chat_invitation.verifying")}</div>;
  }

  if (!invite) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>{t("chat_invitation.not_found_title")}</h2>
        <p>{t("chat_invitation.not_found_desc")}</p>
        <button onClick={() => navigate("/")}>
          {t("chat_invitation.back_home")}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h2>{t("chat_invitation.title")}</h2>

        <p>
          {t("chat_invitation.invited_text")}{" "}
          <strong>{invite.name}</strong>.
        </p>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            disabled={actionLoading}
            onClick={() => handleAction("accept")}
            style={{
              flex: 1,
              padding: "10px",
              background: "#28a745",
              color: "white",
              border: "none",
              cursor: actionLoading ? "not-allowed" : "pointer",
            }}
          >
            {actionLoading
              ? t("chat_invitation.joining")
              : t("chat_invitation.accept")}
          </button>

          <button
            disabled={actionLoading}
            onClick={() => handleAction("reject")}
            style={{
              flex: 1,
              padding: "10px",
              background: "#dc3545",
              color: "white",
              border: "none",
              cursor: actionLoading ? "not-allowed" : "pointer",
            }}
          >
            {t("chat_invitation.decline")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInvitationGate;