import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AxiosConfig from '../config/AxiosConfig';
import './styles/NavBar.css';
import LiminalisLogo from '../assets/LiminalisLogo.png';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Tracks authentication state based on token presence
  const [isLogged, setIsLogged] = useState(() => !!localStorage.getItem('access_token'));

  // Controls mobile menu open/close state
  const [menuOpen, setMenuOpen] = useState(false);

  // Stores logged-in user profile data
  const [user, setUser] = useState(null);

  /**
   * SYNC AUTH STATE
   * - Checks localStorage for token
   * - Updates login state
   * - Clears user if logged out
   */
  const syncAuth = useCallback(() => {
    const token = localStorage.getItem('access_token');
    setIsLogged(!!token);

    if (!token) setUser(null);
  }, []);

  /**
   * Listen for:
   * - storage changes (multi-tab logout/login sync)
   * - custom "auth-changed" event (manual sync after login/logout)
   */
  useEffect(() => {
    syncAuth();

    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-changed', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-changed', syncAuth);
    };
  }, [syncAuth]);

  /**
   * FETCH USER PROFILE WHEN LOGGED IN
   * - Runs whenever auth state changes
   * - Retrieves user info from API
   */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLogged) return;

      try {
        const res = await AxiosConfig.get('/profile');
        const data = res.data.data;

        setUser({
          ...data,
          type: String(data.type) // normalize type to string for comparisons
        });

      } catch (err) {
        console.error(err);
        setUser(null);
      }
    };

    fetchProfile();
  }, [isLogged]);

  /**
   * LOGOUT HANDLER
   * - Calls backend logout endpoint
   * - Clears tokens from localStorage
   * - Redirects to login page
   */
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');

    try {
      if (refreshToken) {
        await AxiosConfig.post('/logout', { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error(err);
    } finally {
      // Always clear auth data even if request fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      window.dispatchEvent(new Event('auth-changed'));
      navigate('/login');
    }
  };

  // Close mobile menu after navigation
  const closeMenu = () => setMenuOpen(false);

  // Check if user is admin (type "1")
  const isAdmin = user?.type === "1";

  return (
    <nav className="navbar">

      {/* LEFT SECTION: logo + avatar */}
      <div className="navbar-left">

        {/* App logo (always visible) */}
        <img
          src={LiminalisLogo}
          alt="logo"
          className="navbar-profile-pic"
          onClick={() => navigate('/')}
        />

        {/* User avatar (only when logged in) */}
        {isLogged && user?.avatar && (
          <img
            src={`http://localhost/liminalis/public/${user.avatar}`}
            alt="avatar"
            className="navbar-profile-pic"
            onClick={() => navigate(`/profile/${user.slug}`)}
          />
        )}
      </div>

      {/* HAMBURGER MENU (mobile toggle) */}
      <div
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </div>

      {/* RIGHT NAVIGATION MENU */}
      <div className={`navbar-right ${menuOpen ? 'open' : ''}`}>

        {/* Always visible links */}
        <Link to="/feed" className="nav-link" onClick={closeMenu}>
          {t('nav.feed')}
        </Link>

        <Link to="/search" className="nav-link" onClick={closeMenu}>
          {t('nav.search_users')}
        </Link>

        {/* CONDITIONAL: Guest vs Logged-in menu */}
        {!isLogged ? (
          <>
            {/* Guest links */}
            <Link to="/register" className="nav-link" onClick={closeMenu}>
              {t('nav.register')}
            </Link>

            <Link to="/login" className="nav-link" onClick={closeMenu}>
              {t('nav.login')}
            </Link>

            <Link to="/" className="nav-link" onClick={closeMenu}>
              {t('nav.home')}
            </Link>
          </>
        ) : (
          <>
            {/* Authenticated user links */}
            <Link to="/chats/discover" className="nav-link" onClick={closeMenu}>
              {t('nav.chat_discovery')}
            </Link>

            {/* Profile link (only if slug exists) */}
            {user?.slug && (
              <Link
                to={`/profile/${user.slug}`}
                className="nav-link"
                onClick={closeMenu}
              >
                {t('nav.my_profile')}
              </Link>
            )}

            <Link to="/posts/new" className="nav-link" onClick={closeMenu}>
              {t('nav.create_post')}
            </Link>

            <Link to="/config" className="nav-link" onClick={closeMenu}>
              {t('nav.settings')}
            </Link>

            {/* Admin-only link */}
            {isAdmin && (
              <Link to="/admin" className="nav-link" onClick={closeMenu}>
                Admin Panel
              </Link>
            )}

            {/* Logout button */}
            <button className="navbar-logout" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}