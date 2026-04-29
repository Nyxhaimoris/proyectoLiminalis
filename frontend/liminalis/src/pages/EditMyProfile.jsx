import React, { useEffect, useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import { getCroppedImg } from '../components/utils/CropImage';
import AxiosConfig from '../config/AxiosConfig';
import './styles/MyProfile.css';

// Base API URL for images
const API_URL = process.env.REACT_APP_API_URL;

const EditMyProfile = () => {
  // Translation function
  const { t } = useTranslation();

  const [user, setUser] = useState({
    name: '',
    username: '',
    description: '',
    avatar: null,
    banner: null,
    followingCount: 0,
    followersCount: 0
  });

  // Preview images (local object URLs)
  const [previews, setPreviews] = useState({ avatar: null, banner: null });

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const bioRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (bioRef.current) {
      bioRef.current.style.height = "auto";
      bioRef.current.style.height = bioRef.current.scrollHeight + "px";
    }
  }, [user.description]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await AxiosConfig.get('/profile');

        const userData = data.data || data;

        // Load user data into state
        setUser({
          ...userData,
          description: userData.description || ''
        });
      } catch (err) {
        showToast(t('profile.errors.fetch'), 'error');
      }
    };

    fetchProfile();
  }, [t]);

  const showToast = (text, type) => {
    setMessage({ text, type });

    // Auto-hide after 3 seconds
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    // If banner → open cropper
    if (type === 'banner') {
      setImageToCrop(objectUrl);
      setShowCropper(true);
    } 
    // If avatar → directly preview + store file
    else {
      setPreviews(prev => ({ ...prev, avatar: objectUrl }));
      setUser(prev => ({ ...prev, avatar: file }));
    }

    // Reset input so same file can be selected again
    e.target.value = null;
  };

  const handleSaveCrop = async () => {
    const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);

    // Convert blob to file for upload
    const croppedFile = new File([croppedImageBlob], "banner.jpg", {
      type: "image/jpeg"
    });

    // Update preview + user state
    setPreviews(prev => ({
      ...prev,
      banner: URL.createObjectURL(croppedFile)
    }));

    setUser(prev => ({ ...prev, banner: croppedFile }));

    // Close cropper modal
    setShowCropper(false);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const formData = new FormData();

    // Append all user fields to FormData
    Object.keys(user).forEach(key => {
      if (user[key] !== null) formData.append(key, user[key]);
    });

    try {
      await AxiosConfig.post('/profile', formData);
      showToast(t('profile.success.save'), 'success');
    } catch (err) {
      showToast(t('profile.errors.save'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const bannerSrc =
    previews.banner ||
    (user.banner && typeof user.banner === 'string'
      ? `${API_URL}/${user.banner}`
      : null);

  const avatarSrc =
    previews.avatar ||
    (user.avatar && typeof user.avatar === 'string'
      ? `${API_URL}/${user.avatar}`
      : null);

  return (
    <div className="wysiwyg-full-page">

      {/* Toast message */}
      {message.text && (
        <div className={`wysiwyg-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <nav className="wysiwyg-nav">
        <div className="nav-content">

          <button className="btn-back">
            <i className="fas fa-arrow-left"></i>
          </button>

          <div className="nav-info">
            <h2>{user.name || t('profile.default_name')}</h2>
            <span>{t('profile.editing_title')}</span>
          </div>

          {/* Save button */}
          <button
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '...' : t('profile.save_btn')}
          </button>

        </div>
      </nav>

      <main className="wysiwyg-container">

        {/* Banner upload */}
        <section
          className="wysiwyg-banner-wrapper"
          onClick={() => bannerInputRef.current.click()}
        >
          {bannerSrc
            ? <img src={bannerSrc} alt="banner" />
            : <div className="banner-void" />
          }

          <div className="wysiwyg-overlay">
            <p>{t('profile.edit_banner')}</p>
          </div>

          <input
            type="file"
            hidden
            ref={bannerInputRef}
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'banner')}
          />
        </section>

        {/* Profile content */}
        <div className="wysiwyg-content">

          {/* Avatar */}
          <div className="wysiwyg-avatar-row">
            <div
              className="wysiwyg-avatar-frame"
              onClick={() => avatarInputRef.current.click()}
            >
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" />
                : <div className="avatar-void" />
              }

              <div className="wysiwyg-overlay-circle">
                <i className="fas fa-plus"></i>
              </div>

              <input
                type="file"
                hidden
                ref={avatarInputRef}
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
            </div>
          </div>

          {/* Editable fields */}
          <div className="wysiwyg-fields">

            {/* Name */}
            <input
              className="field-name"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder={t('profile.placeholders.name')}
            />

            {/* Username */}
            <div className="field-username-container">
              <span>@</span>
              <input
                className="field-username"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                placeholder={t('profile.placeholders.username')}
              />
            </div>

            {/* Bio */}
            <textarea
              ref={bioRef}
              className="field-bio"
              value={user.description}
              onChange={(e) =>
                setUser({ ...user, description: e.target.value })
              }
              placeholder={t('profile.placeholders.bio')}
            />

            {/* Stats */}
            <div className="wysiwyg-stats">
              <p>
                <strong>{user.followingCount || 0}</strong>{' '}
                {t('profile.stats.following')}
              </p>
              <p>
                <strong>{user.followersCount || 0}</strong>{' '}
                {t('profile.stats.followers')}
              </p>
            </div>

          </div>
        </div>
      </main>

      {showCropper && (
        <div className="crop-modal-overlay">
          <div className="card crop-card">

            <header>
              <h3>{t('profile.cropper.title')}</h3>
              <button onClick={() => setShowCropper(false)}>✕</button>
            </header>

            {/* Cropper tool */}
            <div className="crop-engine">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={3 / 1}
                onCropChange={setCrop}
                onCropComplete={(_, b) => setCroppedAreaPixels(b)}
                onZoomChange={setZoom}
              />
            </div>

            {/* Crop controls */}
            <footer>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
              />

              <button
                className="btn btn-primary"
                onClick={handleSaveCrop}
              >
                {t('profile.cropper.done')}
              </button>
            </footer>

          </div>
        </div>
      )}
    </div>
  );
};

export default EditMyProfile;