import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '../components/InputField';
import SubmitButton from '../components/SubmitButton';
import { Link, useNavigate } from 'react-router-dom';
import AxiosConfig from '../config/AxiosConfig';

const LoginPage = () => {
  // Translation function
  const { t } = useTranslation();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // React Router navigation hook
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      // Send login request to backend
      const { data } = await AxiosConfig.post('/login', {
        email,
        password,
      });

      // Save JWT/access token in localStorage
      localStorage.setItem('access_token', data.access_token);

      // Notify app (e.g., navbar) that auth state changed
      window.dispatchEvent(new Event('auth-changed'));

      // Redirect user after successful login
      navigate('/editmyprofile');
    } catch (err) {
      // Extract best possible error message
      const errorText =
        err.response?.data?.message ||
        err.message ||
        t('auth.login.error_generic');

      // Show error message
      setMessage({ text: errorText, isError: true });
    } finally {
      // Stop loading state
      setLoading(false);
    }
  };

  return (
    <div
      className="r-page"
      style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}
    >
      {/* Page title */}
      <h2>{t('auth.login.title')}</h2>

      {/* Login form */}
      <form onSubmit={handleSubmit}>
        {/* Email input */}
        <InputField
          label={t('auth.login.email_label')}
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
        />

        {/* Password input */}
        <InputField
          label={t('auth.login.password_label')}
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
        />

        {/* Submit button */}
        <div style={{ marginTop: '20px' }}>
          <SubmitButton
            label={
              loading
                ? t('auth.login.processing')
                : t('auth.login.submit_btn')
            }
            disabled={loading}
          />
        </div>
      </form>

      {/* Link to registration page */}
      <div style={{ marginTop: '15px' }}>
        <Link to="/register">{t('auth.login.no_account_link')}</Link>
      </div>

      {/* Success / Error message display */}
      {message.text && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: message.isError ? '#fdecea' : '#edf7ed',
            color: message.isError ? '#d32f2f' : '#2e7d32',
            border: `1px solid ${
              message.isError ? '#d32f2f' : '#2e7d32'
            }`,
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default LoginPage;