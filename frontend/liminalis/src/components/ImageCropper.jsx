import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import './styles/ImageCropper.css';

const ImageCropper = ({ image, aspect, onCropComplete, onCancel }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // Updates crop position when user drags image
  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const handleDone = () => {
    onCropComplete(croppedAreaPixels);
  };

  return (
    <div className="cropper-overlay">
      {/* Container for the cropping area */}
      <div className="cropper-container">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        />
      </div>
      {/* Zoom slider */}
      <div className="cropper-controls">
        <input
          type="range"
          min={1} max={3} step={0.1}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
        />
        <div className="cropper-buttons">
          {/* Cancel cropping */}
          <button onClick={onCancel} className="btn-cancel">
            {t('cropper.cancel')}
          </button>
          {/* Confirm cropping */}
          <button onClick={handleDone} className="btn-confirm">
            {t('cropper.crop')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;