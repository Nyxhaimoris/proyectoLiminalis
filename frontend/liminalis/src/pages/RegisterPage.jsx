import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '../components/InputField';
import AvatarUpload from '../components/AvatarUpload';
import SubmitButton from '../components/SubmitButton';
import { Link } from 'react-router-dom';
import AxiosConfig from '../config/AxiosConfig';
import './styles/RegisterPage.css';

const RegisterPage = () => {
  // Translation function for multilingual text
  const { t } = useTranslation();

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on submit
    setLoading(true);
    setMessage({ text: '', isError: false });

    // Create multipart form data for text fields + optional file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);

    // Append avatar only if the user selected one
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      // Send registration request to the backend
      await AxiosConfig.post('/register', formData);

      // Show success message
      setMessage({ text: t('auth.register.success'), isError: false });

      // Reset form fields after successful registration
      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setAvatar(null);
    } catch (err) {
      // Default error message
      let errorText = t('auth.register.error_generic');

      // Try to extract a more specific error from the backend response
      const data = err.response?.data;

      if (data?.messages) {
        // If backend returns multiple validation messages, join them into one string
        errorText =
          typeof data.messages === 'object'
            ? Object.values(data.messages).flat().join(' | ')
            : data.messages;
      } else if (data?.message) {
        errorText = data.message;
      } else if (err.message) {
        errorText = err.message;
      }

      // Display error message
      setMessage({ text: errorText, isError: true });
    } finally {
      // Stop loading state whether request succeeded or failed
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main container */}
      <div
        className="r-page"
        style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}
      >
        {/* Page title */}
        <h2>{t('auth.register.title')}</h2>

        {/* Registration form */}
        <form onSubmit={handleSubmit}>
          {/* Full name input */}
          <InputField
            label={t('auth.register.name_label')}
            name="fullname"
            type="text"
            value={name}
            onChange={setName}
          />

          {/* Username input */}
          <InputField
            label={t('auth.register.username_label')}
            name="username"
            type="text"
            value={username}
            onChange={setUsername}
          />

          {/* Email input */}
          <InputField
            label={t('auth.register.email_label')}
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
          />

          {/* Password input */}
          <InputField
            label={t('auth.register.password_label')}
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
          />

          {/* Avatar upload input */}
          <AvatarUpload
            avatar={avatar}
            onChange={setAvatar}
            label={t('auth.register.avatar_label')}
          />

          {/* Submit button */}
          <div style={{ marginTop: '20px' }}>
            <SubmitButton
              label={loading ? t('auth.register.processing') : t('auth.register.submit_btn')}
              disabled={loading}
            />
          </div>
        </form>

        {/* Link to login page */}
        <div style={{ marginTop: '15px' }}>
          <Link to="/login">{t('auth.register.already_account')}</Link>
        </div>

        {/* Success or error message block */}
        {message.text && (
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: message.isError ? '#fdecea' : '#edf7ed',
              color: message.isError ? '#d32f2f' : '#2e7d32',
              border: `1px solid ${message.isError ? '#d32f2f' : '#2e7d32'}`,
            }}
          >
            {message.text}
          </div>
        )}
      </div>
    </>
  );
};

export default RegisterPage;