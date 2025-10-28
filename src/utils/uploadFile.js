// src/utils/uploadFile.js
import axios from 'axios';

/**
 * uploadFile
 * @param {File} file - ไฟล์ที่ต้องการอัปโหลด
 * @param {string} url - endpoint สำหรับอัปโหลดไฟล์
 * @returns {Promise<number|string>} - คืนค่า id ของไฟล์จาก server
 */
export async function uploadFile(file, url = 'http://localhost:4000/api/images/upload') {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // สมมติว่า server คืน { id: 123, url: '...' }
    return response.data.id;
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
}
