// src/components/ImageUpload.jsx
import React, { useState } from 'react';

export default function ImageUpload({ onFileSelect }) {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    onFileSelect(files); // ส่งไฟล์กลับ parent

    // Generate previews for all selected files
    const previewPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then(setPreviews);
  };

  return (
    <div className="mb-4">
      <input type="file" accept="image/*" multiple onChange={handleFileChange} />
      {previews.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {previews.map((preview, index) => (
            <img
              key={index}
              src={preview}
              alt={`Preview ${index + 1}`}
              className="rounded-md border"
              style={{ maxHeight: '100px', objectFit: 'cover' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
