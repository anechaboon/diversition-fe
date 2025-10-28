import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LightGallery from 'lightgallery/react';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

function SlideShow() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const imagesPerPage = 20;
  const chunkSize = 3;
  const chunkDelay = 200;

  const loadImages = useCallback(async (pageNum) => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      // http://localhost:4000/api/image/getByHashtag
      const res = await axios.post('http://localhost:4000/api/uploads/getByHashtag', {
        params: { hashtag: '', page: pageNum, limit: imagesPerPage }
      });

      const { data, pagination } = res.data;
      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      // โหลดแบบ chunk ทีละน้อย
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await new Promise(resolve => setTimeout(resolve, chunkDelay));
        setImages(prev => [...prev, ...chunk]);
      }

      if (pagination.page >= pagination.totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    loadImages(1);
  }, []);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;
    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      setPage(prev => {
        const next = prev + 1;
        loadImages(next);
        return next;
      });
    }
  }, [loading, hasMore, loadImages]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="App">
      <LightGallery speed={500} plugins={[lgThumbnail, lgZoom]}>
        {images.map(img => (
            <img class="img-slide" alt={img.id} src={`http://localhost:4000${img.file_path}`} loading="lazy" width={330} />
        ))}
      </LightGallery>
      {loading && <div style={{ textAlign: 'center', margin: '1rem' }}>กำลังโหลดรูปภาพ...</div>}
      {!hasMore && <div style={{ textAlign: 'center', color: '#777' }}>ไม่มีข้อมูลเพิ่มเติมแล้ว</div>}
    </div>
  );
}

export default SlideShow;
