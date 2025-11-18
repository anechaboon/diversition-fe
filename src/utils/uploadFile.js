// src/utils/uploadFile.js
import axios from 'axios';

/**
 * uploadFile
 * @param {File} file - ไฟล์ที่ต้องการอัปโหลด
 * @param {string} url - endpoint สำหรับอัปโหลดไฟล์
 * @returns {Promise<number|string>} - คืนค่า id ของไฟล์จาก server
 */
const BASE_URL = import.meta.env.VITE_API_URL;
export async function uploadFile(file, url = BASE_URL+'/api/images/upload') {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('image', file);

  try {
    const resp = await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if(!resp.status){
      throw new Error('Upload failed');
    }
    return resp.data.id;
  } catch (error) {
    return Promise.reject(error);
  }
}
