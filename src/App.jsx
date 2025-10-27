import React, { useState } from 'react';
import HashtagSelect from './components/HashtagSelect';

export default function HashtagForm() {
  const [hashtags, setHashtags] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Selected hashtags:', hashtags);
    // axios.post('/api/post', { hashtags }) ได้เลย
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <HashtagSelect value={hashtags} onChange={setHashtags} />
      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        บันทึก
      </button>
    </form>
  );
}
