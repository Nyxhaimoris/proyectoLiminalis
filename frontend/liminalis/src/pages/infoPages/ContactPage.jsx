import { useTranslation } from 'react-i18next';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="contact-container" style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <h1>{t('contactPage.title')}</h1>
      <p>{t('contactPage.subtitle')}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
        
        <section>
          <form 
            action="https://formspree.io/f/myklnepy" 
            method="POST" 
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <label>{t('contactPage.form.name')}</label>
            <input type="text" name="full_name" required />
            
            <label>{t('contactPage.other_ways.email_label')}</label>
            <input type="email" name="email" required />
            
            <label>{t('contactPage.form.subject')}</label>
            <input type="text" name="subject" placeholder={t('contactPage.form.placeholder_subject')} required />
            
            <label>{t('contactPage.form.message')}</label>
            <textarea name="message" rows="5" required />

            <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
              {t('contactPage.form.send')}
            </button>
          </form>
        </section>

        <section>
          <h3>{t('contactPage.other_ways.title')}</h3>
          <p>
            <strong>{t('contactPage.other_ways.email_label')}:</strong><br />
            koldoaso@gmail.com
          </p>
          
          <p>{t('contactPage.faq_prompt')}</p>
          
          <div style={{ marginTop: '20px' }}>
            <a href="https://github.com/Nyxhaimoris/proyectoLiminalis" target="_blank" rel="noreferrer">
              {t('contactPage.other_ways.github')}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}