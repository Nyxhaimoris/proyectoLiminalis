import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import '../styles/OurStackPage.css';

const OurStackPage = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 18, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const renderSection = (key) => {
    const items = t(`techPage.sections.${key}.items`, { returnObjects: true });

    return (
      <motion.section variants={itemVariants} className="stack-card">
        <h2>{t(`techPage.sections.${key}.title`)}</h2>
        <p>{t(`techPage.sections.${key}.description`)}</p>

        <ul className="stack-list">
          {items.map((item, index) => (
            <li key={index} className="stack-item">
              <span className="stack-check">✔</span>
              <span>{item.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
            </li>
          ))}
        </ul>
      </motion.section>
    );
  };

  return (
    <div className="stack-page">
      <motion.header
        className="stack-header"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="stack-title">{t('techPage.title')}</h1>
        <p className="stack-subtitle">{t('techPage.subtitle')}</p>
      </motion.header>

      <motion.div
        className="stack-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {renderSection('backend')}
        {renderSection('frontend')}
        {renderSection('realtime')}
        {renderSection('tools')}
      </motion.div>

      <motion.footer
        className="stack-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Built with performance, scalability and real-time architecture in mind.
      </motion.footer>
    </div>
  );
};

export default OurStackPage;