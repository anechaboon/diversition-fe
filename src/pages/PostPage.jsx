// src/pages/PostPage.jsx
import React, { useState } from 'react';
import HashtagSelect from '../components/HashtagSelect';
import ImageUpload from '../components/ImageUpload';
import axios from 'axios';
import { uploadFile } from '../utils/uploadFile'
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

export default function PostPage() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [hashtags, setHashtags] = useState([]); // array ของ object {id, name}
  const [imageFiles, setImageFiles] = useState([]); // Changed to array

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      alert('กรุณาเลือกภาพก่อน');
      return;
    }

    try {
      let hashtagIds = hashtags.map(tag => tag.id);
      if (hashtagIds.length === 0) {
        alert('กรุณาเลือกอย่างน้อย 1 hashtag');
        return;
      }

      // Upload all files and get their IDs
      const imageIds = await Promise.all(
        imageFiles.map(file => uploadFile(file))
      );

      await axios.post(`${BASE_URL}/api/post`, {
        image_ids: imageIds, // Send array of image IDs
        hashtags: hashtagIds,
      });
    
      Swal.fire({
        icon: 'success',
        title: 'โพสต์สำเร็จ',
        showConfirmButton: false,
        timer: 2000
      }).then(() => {
        location.reload(); // โหลดหน้าใหม่
      });
      
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">โพสต์รูปพร้อม Hashtags</h1>
      <form onSubmit={handleSubmit}>
        <HashtagSelect value={hashtags} onChange={setHashtags} />
        <ImageUpload onFileSelect={setImageFiles} /> {/* Pass the array setter */}

        <button
          type="submit"
          className="btn btn-primary w-100 px-4 py-2 rounded-md "
        >Save</button>
      </form>
    </div>
    </div>
    </>
  );
}
