import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AxiosConfig from "../../config/AxiosConfig";
import "./styles/ChatSettings.css";

const ChatSettings = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [inviting, setInviting] = useState(false);
  const [sentInvites, setSentInvites] = useState([]);

  // GET ROLE
  useEffect(() => {
    AxiosConfig.get(`/chats/${id}`).then((res) => {
      setRole(res.data?.data?.my_role ?? null);
    });
  }, [id]);

  // LOAD INVITES
  useEffect(() => {
    AxiosConfig.get("/chats/invitations").then((res) => {
      const invites = (res.data?.data || []).filter(
        (i) => Number(i.chat_id) === Number(id)
      );
      setSentInvites(invites);
    });
  }, [id]);

  // SEARCH USERS
  const searchUsers = (value) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    setLoadingSearch(true);

    AxiosConfig.get(`/profile/invite-search?q=${value}`)
      .then((res) => {
        setResults(res.data?.data || []);
      })
      .catch((err) => {
        console.error(err);
        setResults([]);
      })
      .finally(() => {
        setLoadingSearch(false);
      });
  };

  // INVITE USER
  const inviteUser = async (userId) => {
    setInviting(true);

    try {
      await AxiosConfig.post(`/chats/${id}/invite`, {
        user_id: userId,
      });

      const res = await AxiosConfig.get("/chats/invitations");

      setSentInvites(
        (res.data?.data || []).filter(
          (i) => Number(i.chat_id) === Number(id)
        )
      );

      setQuery("");
      setResults([]);
    } catch (err) {
      console.error(err);
      alert(t("chat_settings.errors.invite"));
    } finally {
      setInviting(false);
    }
  };

  // CANCEL INVITE
  const cancelInvite = async (inviteId) => {
    try {
      await AxiosConfig.post(`/chats/invitations/${inviteId}/reject`);

      setSentInvites((prev) =>
        prev.filter((i) => i.id !== inviteId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // LEAVE CHAT
  const handleLeaveChat = async () => {
    if (!window.confirm(t("chat_settings.confirm_leave"))) return;

    try {
      await AxiosConfig.post(`/chats/${id}/leave`);
      navigate("/chats");
    } catch (err) {
      console.error(err);
      alert(t("chat_settings.errors.leave"));
    }
  };

  return (
    <div className="chat-settings-page">
      <header>
        <button onClick={() => navigate(-1)}>
          ← {t("chat_settings.back")}
        </button>
        <h2>{t("chat_settings.title")}</h2>
      </header>

      <div className="settings-content">

        {/* INVITE SECTION */}
        {role === "admin" && (
          <section className="invite-zone">
            <h3>{t("chat_settings.invite_users")}</h3>

            <input
              type="text"
              placeholder={t("chat_settings.search_placeholder")}
              value={query}
              onChange={(e) => searchUsers(e.target.value)}
            />

            {loadingSearch && <p>{t("chat_settings.searching")}</p>}

            <div className="results">
              {results.length === 0 && query.trim() !== "" && !loadingSearch && (
                <p>{t("chat_settings.no_users")}</p>
              )}

              {results.map((user) => {
                const alreadyInvited = sentInvites.some(
                  (i) =>
                    i.invited_user_id === user.id &&
                    i.status === "pending"
                );

                return (
                  <div key={user.id} className="user-row">
                    <span>@{user.username}</span>

                    <button
                      disabled={inviting || alreadyInvited}
                      onClick={() => inviteUser(user.id)}
                    >
                      {alreadyInvited
                        ? t("chat_settings.invited")
                        : t("chat_settings.invite")}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SENT INVITES */}
        {role === "admin" && sentInvites.length > 0 && (
          <section className="invite-zone">
            <h3>{t("chat_settings.pending_invites")}</h3>

            {sentInvites.map((inv) => (
              <div key={inv.id} className="user-row">
                <span>#{inv.invited_user_id}</span>

                <button onClick={() => cancelInvite(inv.id)}>
                  {t("chat_settings.cancel")}
                </button>
              </div>
            ))}
          </section>
        )}

        {/* LEAVE */}
        <section className="danger-zone">
          <h3>{t("chat_settings.danger_zone")}</h3>

          <button onClick={handleLeaveChat}>
            {t("chat_settings.leave_chat")}
          </button>
        </section>

      </div>
    </div>
  );
};

export default ChatSettings;