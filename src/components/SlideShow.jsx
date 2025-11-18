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
  const [hashtagFilter, setHashtagFilter] = useState("");

  const initialLoaded = useRef(false); // ตรวจสอบว่าโหลดครั้งแรกแล้วหรือยัง
  const pageRef = useRef(1); // เก็บ page ปัจจุบันสำหรับ scroll handler

  const imagesPerPage = 10;
  // โหลดรูปจาก API
  const loadImages = async (pageNum, hashtag = "") => {
    if (hashtag === "" && (loading || !hasMore)) return;

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/images/getByHashtag`, {
        params: { hashtag, page: pageNum, limit: imagesPerPage }
      });

      const { data: newData, pagination } = res.data;

      if (!newData || newData.length === 0) {
        setHasMore(false);
        return;
      }

      // โหมด Filter
      if (hashtag !== "") {
        setImages(prev => pageNum === 1 ? newData : [...prev, ...newData]);
        setHasMore(pagination.page < pagination.totalPages);
        return;
      }

      // โหมดปกติ
      setAllImages(prev => [...prev, ...newData]);
      setImages(prev => [...prev, ...newData]);
      setHasMore(pagination.page < pagination.totalPages);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก
  useEffect(() => {
    if (!initialLoaded.current) {
      initialLoaded.current = true;
      loadImages(1);
    }
  }, []);

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.pageYOffset;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    // ดึงข้อมูลเพิ่มเมื่อใกล้สุดหน้า
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      const nextPage = pageRef.current + 1;

      pageRef.current = nextPage;
      setPage(nextPage);

      loadImages(nextPage, hashtagFilter);
    }
  }, [loading, hasMore, hashtagFilter]); // ไม่ต้องมี page แล้ว

  // Register scroll event
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);


  // Filter by hashtag
  const filterByHashtag = async (tag) => {
    setHashtagFilter(tag);
    setIsFiltering(true);

    setPage(1);
    pageRef.current = 1; // reset page ref

    setImages([]);
    setHasMore(true);

    await loadImages(1, tag);
  };

  // Reset filter
  const resetFilter = () => {
    setHashtagFilter("");
    setIsFiltering(false);

    setImages([...allImages]);
    setHasMore(true);

    const restoredPage = Math.ceil(allImages.length / imagesPerPage);
    setPage(restoredPage);
    pageRef.current = restoredPage; // reset page ref
  };


  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 1,
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
            return (
              <div className="text-center my-3">
                ไม่พบรูปภาพ Upload <a href="/upload">ที่นี่</a>
              </div>
            );
          } else if (!hasMore && !isFiltering) {
            return (
              <div className="text-center text-muted my-3">
                ไม่มีข้อมูลเพิ่มเติมแล้ว
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
}

export default SlideShow;
