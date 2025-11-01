import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Masonry from "react-masonry-css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SlideShow.css";

function SlideShow() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [allImages, setAllImages] = useState([]);
  const [images, setImages] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const initialLoaded = useRef(false);

  const imagesPerPage = 20;
  // โหลดรูปจาก API
  const loadImages = useCallback(
    async (pageNum) => {
      if (!hasMore || loading) return;
      setLoading(true);
      try {
        const res = await axios.post(
          `${BASE_URL}/api/images/getByHashtag`,
          { params: { hashtag: "", page: pageNum, limit: imagesPerPage } }
        );
        if(!res.status){
          setHasMore(false);
          return;
        }
        
        const { data: newData, pagination } = res.data;
        if (!newData || newData.length === 0) {
          setHasMore(false);
          return;
        }

        setAllImages(prev => [...prev, ...newData]);
        setImages(prev => [...prev, ...newData]);

        if (pagination.page >= pagination.totalPages) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error loading images:", err);
      } finally {
        setLoading(false);
      }
    },
    [hasMore, loading]
  );

  // โหลดครั้งแรก
  useEffect(() => {
    if (!initialLoaded.current) {
      initialLoaded.current = true;
      loadImages(1);
    }
  }, [loadImages]);

  // Scroll handler
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
  }, [loading, hasMore, loadImages, isFiltering]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Masonry breakpoint
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 1,
  };

  // Filter by hashtag
  const filterByHashtag = (tag) => {
    setIsFiltering(true);
    const filtered = allImages.filter(img => img.hashtags?.includes(tag));
    setImages(filtered);
    setHasMore(false);
  };

  // Reset filter
  const resetFilter = () => {
    setIsFiltering(false);
    setImages([...allImages]); 
    setHasMore(true);
    setPage(Math.ceil(allImages.length / imagesPerPage));
  };

  return (
    <div className="container my-3">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {images.map((img) => (
          <div className="masonry-item" key={img.id ?? img.file_path}>
            <div className="img-wrapper">
              <a href={`${BASE_URL}${img.file_path}`}>
                <img
                  className="img-fluid rounded img-slide"
                  src={`${BASE_URL}${img.file_path}`}
                  alt=""
                  loading="lazy"
                />
              </a>
              <div className="hashtags-overlay">
                {img.hashtags?.map((tag, idx) => (
                  <span
                    className="hashtag px-1 cursor-pointer"
                    key={idx}
                    onClick={() => filterByHashtag(tag)}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Masonry>

      {isFiltering && (
        <div className="text-center my-3">
          <button className="btn btn-secondary" onClick={resetFilter}>
            รีเซ็ตการกรอง
          </button>
        </div>
      )}
      {loading && <div className="text-center my-3">กำลังโหลดรูปภาพ...</div>}

        <div>
        {(() => {
          if (images.length === 0 && !loading) {
            return <div className="text-center my-3">ไม่พบรูปภาพ Upload <a href='/upload'>ที่นี่</a></div>;
          } else if (!hasMore && !isFiltering) {
            return <div className="text-center text-muted my-3">
                ไม่มีข้อมูลเพิ่มเติมแล้ว
              </div>;
          }
        })()}
      </div>
    </div>
  );
}

export default SlideShow;
