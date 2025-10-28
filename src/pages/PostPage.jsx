// src/pages/PostPage.jsx
import React, { useState } from 'react';
import HashtagSelect from '../components/HashtagSelect';
import ImageUpload from '../components/ImageUpload';
import axios from 'axios';
import { uploadFile } from '../utils/uploadFile'
import Navbar from '../components/Navbar';

export default function PostPage() {
  const [hashtags, setHashtags] = useState([]); // array ของ object {id, name}
  const [imageFile, setImageFile] = useState(null);

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert('กรุณาเลือกภาพก่อน');
      return;
    }

    try {
      // let hashtagIds = hashtags.map(tag => tag.id);
      // if (hashtagIds.length === 0) {
      //   alert('กรุณาเลือกอย่างน้อย 1 hashtag');
      //   return;
      // }
      let hashtagIds = [18]
      const imageId = await uploadFile(imageFile);

      const response = await axios.post('http://localhost:4000/api/post', {
        image_id: imageId,
        hashtags: hashtagIds,
      });

      console.log('Post success:', response.data);
      // alert('บันทึกสำเร็จ');
      setHashtags([]);
      setImageFile(null);
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
        <ImageUpload onFileSelect={setImageFile} />
        <HashtagSelect value={hashtags} onChange={setHashtags} />
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          บันทึก
        </button>
      </form>
    </div>
    </div>
    </>
  );
}
