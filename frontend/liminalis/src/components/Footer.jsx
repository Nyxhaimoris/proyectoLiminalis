import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './styles/Footer.css';

export default function Footer() {
  const { t } = useTranslation(); // Uses translations for the footer

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          &copy; {new Date().getFullYear()} Liminalis Social. {t('footer.rights')}
        </p>
        <div className="footer-links">
          <Link to="/about" className="footer-link">{t('footer.about')}</Link>
          <Link to="/privacy" className="footer-link">{t('footer.privacy')}</Link>
          <Link to="/contact" className="footer-link">{t('footer.contact')}</Link>
          <Link to={"/tech-stack"} className='footer-link'>{t('footer.tech')}</Link>
        </div>
      </div>
    </footer>
  );
}