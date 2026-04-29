import React, { useState, useEffect, useCallback } from "react";
import AxiosConfig from "../../config/AxiosConfig";
import "./styles/AdminDashboard.css";
import Pagination from "../../components/utils/Pagination";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [meta, setMeta] = useState({
    total: 0,
    pages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint =
        activeTab === "users" ? "/admin/users" : "/admin/posts";

      const res = await AxiosConfig.get(endpoint, {
        params: { page, limit, search },
      });

      setData(res.data?.data ?? []);
      setMeta(res.data?.meta ?? { total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || "Error loading data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------- TAB SWITCH ----------------
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
  };

  // ---------------- ACTIONS ----------------
  const handleBanToggle = async (userId) => {
    try {
      await AxiosConfig.post(`/admin/users/${userId}/toggle-ban`);

      setData((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, banned: u.banned === 1 ? 0 : 1 }
            : u
        )
      );
    } catch {
      alert("Failed to update user status");
    }
  };

  const handlePromote = async (userId) => {
    try {
      const res = await AxiosConfig.post(
        `/admin/users/${userId}/promote`
      );

      const newType = res.data.type;

      setData((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, type: newType }
            : u
        )
      );
    } catch {
      alert("Failed to update role");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await AxiosConfig.delete(`/admin/posts/${postId}`);
      setData((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      alert("Error deleting post");
    }
  };

  const isAdmin = (user) => Number(user.type) === 1;
  const isBanned = (user) => user.banned === 1;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Panel</h1>

        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${
              activeTab === "users" ? "active" : ""
            }`}
            onClick={() => handleTabChange("users")}
          >
            Users
          </button>

          <button
            className={`admin-tab-btn ${
              activeTab === "posts" ? "active" : ""
            }`}
            onClick={() => handleTabChange("posts")}
          >
            Posts
          </button>
        </div>
      </header>

      {/* SEARCH */}
      <input
        className="admin-search"
        placeholder={`Search ${activeTab}...`}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                {activeTab === "users" ? (
                  <>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id}>
                    {activeTab === "users" ? (
                      <>
                        <td>{item.id}</td>
                        <td>{item.username}</td>
                        <td>{item.email}</td>

                        <td>
                          <span
                            className={
                              isBanned(item)
                                ? "status banned"
                                : "status active"
                            }
                          >
                            {isBanned(item) ? "Banned" : "Active"}
                          </span>
                        </td>

                        <td>
                          <span className="role-badge">
                            {isAdmin(item) ? "Admin" : "User"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn-ban"
                            onClick={() => handleBanToggle(item.id)}
                          >
                            {isBanned(item) ? "Unban" : "Ban"}
                          </button>

                          <button
                            className="btn-promote"
                            onClick={() => handlePromote(item.id)}
                          >
                            {isAdmin(item) ? "Demote" : "Promote"}
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.id}</td>
                        <td>{item.title}</td>
                        <td>{item.author_name}</td>
                        <td>
                          {item.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={() =>
                              handleDeletePost(item.id)
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            page={page}
            setPage={setPage}
            totalPages={meta.pages}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;