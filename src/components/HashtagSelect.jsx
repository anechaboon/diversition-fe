import React, { useState, useRef, useCallback } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import axios from 'axios';
import debounce from 'lodash.debounce';


const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/api/hashtags`;
const DEBOUNCE_MS = 300;

export default function HashtagSelect({ value, onChange }) {
  const [lastQueryOptions, setLastQueryOptions] = useState([]);
  const cancelSourceRef = useRef(null);

  // ตัด # และ trim ช่องว่าง
  const normalizeInput = (s) => (s || '').replace(/^#/, '').trim();

  const loadOptions = (inputValue) => {
    const q = normalizeInput(inputValue); // ตัด # และ trim ช่องว่าง
    return new Promise((resolve) => debouncedFetch(q, resolve)); // ส่ง query ไป fetchOptions
  };

  // debounce เพื่อเลี่ยงการยิง API ถี่เกิน
  const debouncedFetch = useCallback( // ใช้ useCallback เพื่อไม่ให้ฟังก์ชันเปลี่ยนทุกเรนเดอร์
    debounce((query, resolve) => { // ดีเลย์การเรียก
      fetchOptions(query).then(resolve).catch(() => resolve([]));
    }, DEBOUNCE_MS),
    []
  );

  // โหลดข้อมูลจาก API (ตาม query)
  const fetchOptions = async (query) => {
    if (cancelSourceRef.current) { // ยกเลิกคำขอก่อนหน้า
      try {
        cancelSourceRef.current.cancel('cancel previous');
      } catch (e) {
        console.error('cancel error', e);
      }
    }
    cancelSourceRef.current = axios.CancelToken.source(); // สร้าง cancel token ใหม่

    try {
      const res = await axios.get(`${API_URL}?search=${encodeURIComponent(query)}`, {
        cancelToken: cancelSourceRef.current.token, // แนบ token กับคำขอ เพื่อให้ยกเลิกได้
      });

      const hashtags = res.data?.data || [];
      const options = hashtags.map((tag) => ({
        id: tag.id,
        value: tag.name,
        label: `#${tag.name}`,
      }));

      setLastQueryOptions(options);
      return options;
    } catch (err) {
      if (axios.isCancel(err)) return [];
      console.error('fetchOptions error', err);
      setLastQueryOptions([]);
      return [];
    }
  };

  // ตรวจว่า input มีอยู่ใน options หรือ selected แล้วหรือไม่
  const existsInOptionsOrSelected = (rawInput) => {
    const normalized = normalizeInput(rawInput).toLowerCase();
    if (!normalized) return false;
    if ((lastQueryOptions || []).some((o) => o.value.toLowerCase() === normalized)) return true;
    if ((value || []).some((s) => s.value.toLowerCase() === normalized)) return true;
    return false;
  };

  // สร้างแฮชแท็กใหม่
  const handleCreate = async (inputValue) => {
    const name = normalizeInput(inputValue);
    if (!name || existsInOptionsOrSelected(name)) return;

    try {
      const res = await axios.post(API_URL, { name });
      const created = res.data?.data || { name };
      const newOption = { id: created.id, value: created.name, label: `#${created.name}` };
      onChange([...(value || []), newOption]); // เพิ่มตัวเลือกใหม่เข้าไป
    } catch (err) {
      console.error('create hashtag error', err);
    }
  };

  return (
    <AsyncCreatableSelect
      className='mb-4'
      isMulti
      defaultOptions
      loadOptions={loadOptions}
      onChange={onChange}
      value={value}
      onCreateOption={handleCreate}
      formatCreateLabel={(inputValue) =>
        existsInOptionsOrSelected(inputValue)
          ? '' // ❌ ไม่แสดงปุ่ม create ถ้ามีอยู่แล้ว
          : `สร้างแฮชแท็กใหม่: #${normalizeInput(inputValue)}`
      }
      placeholder="ค้นหา หรือสร้าง #แฮชแท็ก"
      styles={{
        menu: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
}
