import { useTranslation } from 'react-i18next';
import '../styles/PrivacyPage.css';

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', lineHeight: '1.6' }}>
      <h1>{t('privacyPage.title')}</h1>
      <p><strong>{t('privacyPage.lastUpdate')}:</strong> 05/04/2026</p>

      {/* Sección 1: Información */}
      <h2>{t('privacyPage.sections.info.title')}</h2>
      <p>{t('privacyPage.sections.info.subtitle')}</p>
      
      <h3>{t('privacyPage.sections.info.user_provided_title')}</h3>
      <ul>
        {t('privacyPage.sections.info.user_items', { returnObjects: true }).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <h3>{t('privacyPage.sections.info.auto_title')}</h3>
      <ul>
        {t('privacyPage.sections.info.auto_items', { returnObjects: true }).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      {/* Sección 2: Uso */}
      <h2>{t('privacyPage.sections.usage.title')}</h2>
      <ul>
        {t('privacyPage.sections.usage.items', { returnObjects: true }).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      {/* Sección 3: Compartición */}
      <h2>{t('privacyPage.sections.sharing.title')}</h2>
      <p>{t('privacyPage.sections.sharing.description')}</p>

      {/* Sección 8: Contacto */}
      <h2>{t('privacyPage.sections.contact.title')}</h2>
      <p>
        {t('privacyPage.sections.contact.description')}
        <br />
        <strong>koldoaso@gmail.com</strong>
      </p>
    </div>
  );
};

export default PrivacyPage;