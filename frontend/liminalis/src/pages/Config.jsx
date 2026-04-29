import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../config/ConfigContext';
import ConfigItem from '../components/ConfigItem';
import AxiosConfig from '../config/AxiosConfig';
import './styles/Config.css';

const Config = () => {
  const { t, i18n } = useTranslation();
  const { settings, setSettings } = useConfig();

  // Loading state for theme/language
  const [loadingKey, setLoadingKey] = useState(null);

  // States for Password Change section
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState(null);

  /**
   * Updates general settings (Theme, Language, etc.)
   */
  const updateSetting = async (key, value) => {
    setLoadingKey(key);
    try {
      await AxiosConfig.post('/settings', { key, value });

      setSettings(prev => ({ ...prev, [key]: value }));

      if (key === 'language') {
        i18n.changeLanguage(value);
      }
      if (key === 'fontSize') {
        document.documentElement.style.fontSize = value;
      }
      if (key === 'theme') {
        document.documentElement.setAttribute('data-theme', value);
      }
    } catch (err) {
      console.error("Error saving setting", err);
    } finally {
      setLoadingKey(null);
    }
  };

  /**
   * Handles the Password Change submission
   */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage(null);

    try {
      const response = await AxiosConfig.post('/profile/changePassword', passwords);

      setPassMessage({ type: 'success', text: response.data.message });
      setPasswords({ currentPassword: '', newPassword: '' }); // Reset form
    } catch (err) {
      const errorMsg = err.response?.data?.messages?.error || "Error updating password";
      setPassMessage({ type: 'error', text: errorMsg });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h2>{t('settings.title')}</h2>

      <div className="settings-group">
        <div className="settings-divider">
          {t('settings.sections.appearance') || "Appearance"}
        </div>

        {/* Configuration items */}
        <ConfigItem
          label={t('settings.theme')}
          description={t('settings.theme_desc')}
          value={settings.theme || 'light'}
          onChange={(val) => updateSetting('theme', val)}
          loading={loadingKey === 'theme'}
          options={[
            { value: 'light', label: t('settings.themes.light') },
            { value: 'dark', label: t('settings.themes.dark') },
            { value: 'liminalis', label: t('settings.themes.liminalis') || 'Liminalis' },
            { value: 'chocolate', label: t('settings.themes.chocolate') || 'Chocolate' },
            { value: 'cyberpunk', label: t('settings.themes.cyberpunk') || 'Cyberpunk' },
            { value: 'europe', label: t('settings.themes.europe') || 'Europe' },
            { value: 'aurora', label: t('settings.themes.aurora') || 'Aurora' },
          ]}
        />
        <ConfigItem
          label={t('settings.font_size') || "Font Size"}
          value={settings.fontSize || '16px'}
          onChange={(val) => updateSetting('fontSize', val)}
          loading={loadingKey === 'fontSize'}
          options={[
            { value: '14px', label: t('settings.textsize.small') || 'Small' },
            { value: '16px', label: t('settings.textsize.medium') || 'Medium' },
            { value: '18px', label: t('settings.textsize.large') || 'Large' },
            { value: '20px', label: t('settings.textsize.extra') || 'Extra Large' },
          ]}
        />
      </div>

      <div className="settings-group">
        <div className="settings-divider">
          {t('settings.sections.language') || "Language"}
        </div>

        <ConfigItem
          label={t('settings.language_label')}
          description={t('settings.language_desc')}
          value={settings.language || i18n.language}
          onChange={(val) => updateSetting('language', val)}
          loading={loadingKey === 'language'}
          options={[
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
            { value: 'it', label: 'Italiano' }
          ]}
        />
      </div>

      <div className="settings-group">
        <div className="settings-divider">
          {t('settings.sections.privacy') || "Privacy"}
        </div>

        <ConfigItem
          label={t('settings.follower_privacy_label') || "Followers & Following visibility"}
          description={
            t('settings.follower_privacy_desc') ||
            "Control who can see your followers and who you follow"
          }
          value={settings.followers_visibility || 'public'}
          onChange={(val) => updateSetting('followers_visibility', val)}
          loading={loadingKey === 'followers_visibility'}
          options={[
            { value: 'public', label: t('settings.privacy.public') || 'Public' },
            { value: 'mutual', label: t('settings.privacy.mutual') || 'Mutual followers only' },
            { value: 'private', label: t('settings.privacy.private') || 'Only me' }
          ]}
        />
      </div>

      <div className="settings-group">
        <div className="settings-divider">
          {t('settings.sections.security') || "Security"}
        </div>

        <form onSubmit={handleChangePassword} className="password-form">
          <div className="config-password-field">
            <label>{t('settings.current_password') || "Current Password"}</label>
            <input
              type="password"
              className="config-input"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
            />
          </div>

          <div className="config-password-field">
            <label>{t('settings.new_password') || "New Password"}</label>
            <input
              type="password"
              className="config-input"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>

          {passMessage && (
            <div className={`settings-message ${passMessage.type}`}>
              {passMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="config-button btn btn-primary"
            disabled={passLoading}
          >
            {passLoading ? t('settings.saving') : (t('settings.change_password_btn') || "Update Password")}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Config;