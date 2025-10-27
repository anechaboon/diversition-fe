// src/components/ImageUpload.jsx
import React, { useState } from 'react';

export default function ImageUpload({ onFileSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onFileSelect(file); // ส่งไฟล์กลับ parent

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-4">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-2 rounded-md border"
          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}
