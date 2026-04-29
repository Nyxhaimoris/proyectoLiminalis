import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TrueFocus from '../external/TrueFocus';
import Galaxy from '../external/Galaxy';
import '../external/Galaxy.css';
import './styles/Home.css';

export default function Home() {
  const { t } = useTranslation();
  const isLogged = !!localStorage.getItem('access_token');

  return (
    /* Component for the galaxy background */
    <div style={{ width: '100%', height: '200%', position: 'relative' }}>
      <Galaxy
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
        mouseRepulsion
        mouseInteraction
        density={0.2}
        glowIntensity={0.1}
        saturation={0}
        hueShift={120}
        twinkleIntensity={0.3}
        rotationSpeed={0.1}
        repulsionStrength={0}
        autoCenterRepulsion={0}
        starSpeed={0.5}
        speed={1}
      />

      <div className="home-container">
        <section className="hero-section">
          <TrueFocus
            sentence="Liminalis Social"
            manualMode={false}
            blurAmount={7}
            borderColor="#fff700"
            animationDuration={1.2}
            pauseBetweenAnimations={1}
          />

          <p className="hero-subtitle">
            {t('home.hero_subtitle')}
          </p>

          <div className="hero-buttons">
            {!isLogged ? (
              <>
                <Link to="/register" className="btn btn-primary">
                  {t('home.buttons.register')}
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  {t('home.buttons.login')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/feed" className="btn btn-primary">
                  {t('home.buttons.go_to_feed')}
                </Link>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.reload();
                  }}
                >
                  {t('home.buttons.logout')}
                </button>
              </>
            )}
          </div>
        </section>

        <section className="features-section">
          <h2>{t('home.features.title')}</h2>
          <div className="features-cards">
            <div className="card">
              <h3>{t('home.features.posts.title')}</h3>
              <p>{t('home.features.posts.description')}</p>
            </div>
            <div className="card">
              <h3>{t('home.features.profiles.title')}</h3>
              <p>{t('home.features.profiles.description')}</p>
            </div>
            <div className="card">
              <h3>{t('home.features.chats.title')}</h3>
              <p>{t('home.features.chats.description')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}