import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import truchaGif from '../../assets/trucha.gif';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const redirectPath = '/';

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.description')}</p>

        <Link 
          to={redirectPath} 
          style={{ 
            display: 'inline-block', 
            marginTop: '20px', 
            padding: '10px 20px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}
        >
          {t('notFound.backHome')} {/* Ir al Inicio */}
        </Link>

        <div style={{ marginTop: '20px' }}>
          <img src={truchaGif} alt="Trucha" style={{ maxWidth: '500px' }} />
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;