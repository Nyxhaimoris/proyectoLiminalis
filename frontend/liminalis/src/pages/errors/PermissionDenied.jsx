import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/PermissionDenied.css';

export default function PermissionDenied() {
  const { t } = useTranslation(); 

  return (
    <div className="pd-container">
      <div className="pd-card"> 
        <h1>{t('auth.denied.title')}</h1>
        <p>{t('auth.denied.description')}</p>
        <Link to="/" className="btn btn-primary">
          {t('auth.denied.back_home')}
        </Link>
      </div>
    </div>
  );
}