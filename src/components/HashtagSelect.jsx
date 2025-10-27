import React, { useState, useRef, useCallback } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import axios from 'axios';
import debounce from 'lodash.debounce';

const API_URL = 'http://localhost:4000/api/hashtags'; // ✅ พอร์ต 4000
const DEBOUNCE_MS = 300;

export default function HashtagSelect({ value, onChange }) {
  const [lastQueryOptions, setLastQueryOptions] = useState([]);
  const cancelSourceRef = useRef(null);

  // ตัด # และ trim ช่องว่าง
  const normalizeInput = (s) => (s || '').replace(/^#/, '').trim();

  // โหลดข้อมูลจาก API (ตาม query)
  const fetchOptions = async (query) => {
    if (cancelSourceRef.current) {
      try {
        cancelSourceRef.current.cancel('cancel previous');
      } catch (e) {
        console.error('cancel error', e);
      }
    }
    cancelSourceRef.current = axios.CancelToken.source();

    try {
      const res = await axios.get(`${API_URL}?search=${encodeURIComponent(query)}`, {
        cancelToken: cancelSourceRef.current.token,
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

  // debounce เพื่อเลี่ยงการยิง API ถี่เกิน
  const debouncedFetch = useCallback(
    debounce((query, resolve) => {
      fetchOptions(query).then(resolve).catch(() => resolve([]));
    }, DEBOUNCE_MS),
    []
  );

  const loadOptions = (inputValue) => {
    const q = normalizeInput(inputValue);
    if (!q) {
      setLastQueryOptions([]);
      if (cancelSourceRef.current) {
        try {
          cancelSourceRef.current.cancel('empty query');
        } catch (e) {
          console.error('cancel error', e);
        }
      }
      return Promise.resolve([]);
    }
    return new Promise((resolve) => debouncedFetch(q, resolve));
  };

  // ตรวจว่า input มีอยู่ใน options หรือ selected แล้วหรือไม่
  const existsInOptionsOrSelected = (rawInput) => {
    const normalized = normalizeInput(rawInput).toLowerCase();
    if (!normalized) return false;
    if ((lastQueryOptions || []).some((o) => o.value.toLowerCase() === normalized)) return true;
    if ((value || []).some((s) => s.value.toLowerCase() === normalized)) return true;
    return false;
  };

  // เมื่อผู้ใช้พิมพ์ hashtag ใหม่
  const handleCreate = async (inputValue) => {
    const name = normalizeInput(inputValue);
    if (!name || existsInOptionsOrSelected(name)) return;

    try {
      const res = await axios.post(API_URL, { name });
      const created = res.data?.data || { name };
      const newOption = { id: created.id, value: created.name, label: `#${created.name}` };
      onChange([...(value || []), newOption]);
    } catch (err) {
      console.error('create hashtag error', err);
    }
  };

  return (
    <AsyncCreatableSelect
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
      noOptionsMessage={() => 'ไม่พบแฮชแท็กอื่นที่ค้นหา'}
      styles={{
        menu: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
}
