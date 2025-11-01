// src/components/ImageUpload.jsx
import React, { useState } from 'react';
import heic2any from "heic2any";

export default function ImageUpload({ onFileSelect }) {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const convertedFiles = await Promise.all(
      files.map(async (file) => {
        // ตรวจสอบถ้าเป็น .heic ให้แปลงเป็น jpeg
        if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
          try {
            const convertedBlob = await heic2any({
              blob: file,
              toType: "image/jpeg",
            });

            // เปลี่ยนชื่อไฟล์ใหม่เป็น .jpg
            const convertedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, ".jpg"), {
              type: "image/jpeg",
            });

            return convertedFile;
          } catch (err) {
            console.error("แปลง HEIC เป็น JPEG ไม่สำเร็จ:", err);
            return file; // fallback: ส่งไฟล์เดิมกลับ
          }
        }
        return file;
      })
    );

    // ส่งไฟล์ที่แปลงแล้วกลับไปยัง parent
    onFileSelect(convertedFiles);

    // สร้าง preview สำหรับทุกไฟล์
    const previewPromises = convertedFiles.map((file) => {
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
