import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Masonry from 'react-masonry-css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SlideShow.css';

function SlideShow() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const initialLoaded = useRef(false);

  const imagesPerPage = 20;

  const loadImages = useCallback(async (pageNum) => {
    if (!hasMore || loading) return;
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:4000/api/uploads/getByHashtag', {
        params: { hashtag: '', page: pageNum, limit: imagesPerPage }
      });

      const { data, pagination } = res.data;
      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      // append รูปภาพใหม่
      setImages(prev => [...prev, ...data]);

      if (pagination.page >= pagination.totalPages) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading]);

  // โหลดครั้งแรก
  useEffect(() => {
    if (!initialLoaded.current) {
      initialLoaded.current = true;
      loadImages(1);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;
    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
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

  // Breakpoint ของ Masonry (responsive)
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 1
  };

  return (
    <div className="container my-3">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {images.map(img => (
          <div className="masonry-item" key={img.id ?? img.file_path}>
            <a href={img.file_path}>
              <img
                className="img-fluid rounded img-slide"
                src={`http://localhost:4000${img.file_path}`}
                alt=""
                loading="lazy"
              />
            </a>
          </div>
        ))}
      </Masonry>

      {loading && <div className="text-center my-3">กำลังโหลดรูปภาพ...</div>}
      {!hasMore && <div className="text-center text-muted my-3">ไม่มีข้อมูลเพิ่มเติมแล้ว</div>}
    </div>
  );
}

export default SlideShow;
