import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '20px', lineHeight: '1.7' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{t('aboutPage.title')}</h1>
        <div style={{ width: '60px', height: '4px', backgroundColor: '#007bff', margin: '0 auto' }}></div>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2>{t('aboutPage.mission_title')}</h2>
        <p style={{ fontSize: '1.1rem' }}>{t('aboutPage.mission_text')}</p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>{t('aboutPage.features_title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          
          <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>{t('aboutPage.features.privacy.title')}</h3>
            <p>{t('aboutPage.features.privacy.desc')}</p>
          </div>

          <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>{t('aboutPage.features.custom.title')}</h3>
            <p>{t('aboutPage.features.custom.desc')}</p>
          </div>

          <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>{t('aboutPage.features.open.title')}</h3>
            <p>{t('aboutPage.features.open.desc')}</p>
          </div>
          
        </div>
      </section>

      <hr style={{ margin: '40px 0', opacity: '0.2' }} />

      <section style={{ textAlign: 'center' }}>
        <h2>{t('aboutPage.team_title')}</h2>
        <p>{t('aboutPage.team_text')}</p>
        <p style={{ marginTop: '20px' }}>
          <a 
            href="https://github.com/Nyxhaimoris/proyectoLiminalis" 
            target="_blank" 
            rel="noreferrer"
            style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}
          >
            GitHub Repository
          </a>
        </p>
      </section>
    </div>
  );
}